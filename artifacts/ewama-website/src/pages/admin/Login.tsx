import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft } from 'lucide-react';
import {
  useAdminLogin,
  useRequestPasswordReset,
  useConfirmPasswordReset,
  getGetMeQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiErrorMessage } from '@/lib/apiErrorMessage';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const resetSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email'),
  code: z.string().min(4, 'Enter the 6-digit code from your email'),
  newPassword: z.string().min(8, 'Use at least 8 characters'),
});

type Mode = 'login' | 'request' | 'confirm';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>('login');

  const loginMutation = useAdminLogin();
  const requestReset = useRequestPasswordReset();
  const confirmReset = useConfirmPasswordReset();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '', code: '', newPassword: '' },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data }, {
      onSuccess: async (res) => {
        localStorage.setItem('admin_token', res.token);
        toast({ title: 'Login successful' });
        await queryClient.refetchQueries({ queryKey: getGetMeQueryKey() });
        setLocation('/admin');
      },
      onError: (err) => {
        toast({ title: 'Login failed', description: apiErrorMessage(err, 'Incorrect email or password'), variant: 'destructive' });
      },
    });
  };

  const onRequest = () => {
    const email = resetForm.getValues('email').trim().toLowerCase();
    if (!z.string().email().safeParse(email).success) {
      resetForm.setError('email', { message: 'Please enter a valid email' });
      return;
    }
    requestReset.mutate({ data: { email } }, {
      onSuccess: () => {
        toast({ title: 'Check your email', description: 'If that address is an admin, a 6-digit code is on its way.' });
        setMode('confirm');
      },
      onError: (err) => toast({ title: 'Something went wrong', description: apiErrorMessage(err, 'Please try again.'), variant: 'destructive' }),
    });
  };

  const onConfirm = (data: z.infer<typeof resetSchema>) => {
    confirmReset.mutate({ data }, {
      onSuccess: () => {
        toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
        form.setValue('email', data.email);
        setMode('login');
      },
      onError: (err) => toast({ title: 'Could not reset password', description: apiErrorMessage(err, 'The code may be invalid or expired.'), variant: 'destructive' }),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="EWAMA Properties Ltd" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="font-heading font-semibold text-2xl text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'login' ? 'Sign in to manage EWAMA Properties' : 'Reset your password'}
          </p>
        </div>

        {mode === 'login' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl><Input placeholder="admin@ewamaproperties.com" type="email" autoCapitalize="none" autoCorrect="off" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white h-11 text-base font-medium" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
              </Button>
              <button
                type="button"
                onClick={() => { resetForm.setValue('email', form.getValues('email')); setMode('request'); }}
                className="w-full text-sm text-secondary hover:text-secondary/80 font-medium"
              >
                Forgot your password?
              </button>
            </form>
          </Form>
        )}

        {mode === 'request' && (
          <div className="space-y-6">
            <Form {...resetForm}>
              <div className="space-y-6">
                <FormField control={resetForm.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your admin email</FormLabel>
                    <FormControl><Input placeholder="admin@ewamaproperties.com" type="email" autoCapitalize="none" autoCorrect="off" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="button" onClick={onRequest} className="w-full bg-primary hover:bg-primary/90 text-white h-11 text-base font-medium" disabled={requestReset.isPending}>
                  {requestReset.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send verification code'}
                </Button>
              </div>
            </Form>
            <button type="button" onClick={() => setMode('login')} className="flex items-center justify-center gap-1 w-full text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </button>
          </div>
        )}

        {mode === 'confirm' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500 -mt-2">Enter the 6-digit code we emailed you, then choose a new password.</p>
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(onConfirm)} className="space-y-6">
                <FormField control={resetForm.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification code</FormLabel>
                    <FormControl><Input placeholder="123456" inputMode="numeric" maxLength={6} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={resetForm.control} name="newPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl><Input type="password" placeholder="At least 8 characters" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white h-11 text-base font-medium" disabled={confirmReset.isPending}>
                  {confirmReset.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Set new password'}
                </Button>
              </form>
            </Form>
            <button type="button" onClick={() => setMode('request')} className="flex items-center justify-center gap-1 w-full text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" /> Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
