import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useAdminLogin, getGetMeQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  // trim + lowercase so a stray space or capital from autofill/phone keyboards
  // can't fail validation or cause a false "invalid credentials" on the server.
  email: z.string().trim().toLowerCase().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const loginMutation = useAdminLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data }, {
      onSuccess: async (res) => {
        localStorage.setItem('admin_token', res.token);
        toast({ title: 'Login successful' });
        // The auth provider caches the earlier "not logged in" answer;
        // refetch it with the new token before entering the admin area,
        // otherwise ProtectedRoute bounces straight back to the login page.
        await queryClient.refetchQueries({ queryKey: getGetMeQueryKey() });
        setLocation('/admin');
      },
      onError: () => {
        toast({ 
          title: 'Login failed', 
          description: 'Please check your credentials',
          variant: 'destructive'
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="EWAMA Properties Ltd"
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="font-heading font-semibold text-2xl text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to manage EWAMA Properties</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@ewamaproperties.com" type="email" autoCapitalize="none" autoCorrect="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white h-11 text-base font-medium"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
