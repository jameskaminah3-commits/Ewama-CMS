import { AdminLayout } from '@/components/admin/AdminLayout';
import { useGetHomepageContent, useUpdateHomepageContent } from '@workspace/api-client-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const homepageSchema = z.object({
  heroHeading: z.string().optional().nullable(),
  heroSubheading: z.string().optional().nullable(),
  heroImage: z.string().optional().nullable(),
  mission: z.string().optional().nullable(),
  vision: z.string().optional().nullable(),
  communityImpact: z.string().optional().nullable(),
  statsYearsInBusiness: z.coerce.number().optional().nullable(),
  statsPropertiesSold: z.coerce.number().optional().nullable(),
  statsHappyClients: z.coerce.number().optional().nullable(),
  statsCountiesCovered: z.coerce.number().optional().nullable(),
});

export default function AdminHomepage() {
  const { data: content, isLoading } = useGetHomepageContent();
  const updateMutation = useUpdateHomepageContent();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof homepageSchema>>({
    resolver: zodResolver(homepageSchema),
    defaultValues: {
      heroHeading: '',
      heroSubheading: '',
      heroImage: '',
      mission: '',
      vision: '',
      communityImpact: '',
      statsYearsInBusiness: 0,
      statsPropertiesSold: 0,
      statsHappyClients: 0,
      statsCountiesCovered: 0,
    },
  });

  useEffect(() => {
    if (content) {
      form.reset({
        heroHeading: content.heroHeading || '',
        heroSubheading: content.heroSubheading || '',
        heroImage: content.heroImage || '',
        mission: content.mission || '',
        vision: content.vision || '',
        communityImpact: content.communityImpact || '',
        statsYearsInBusiness: content.statsYearsInBusiness || 0,
        statsPropertiesSold: content.statsPropertiesSold || 0,
        statsHappyClients: content.statsHappyClients || 0,
        statsCountiesCovered: content.statsCountiesCovered || 0,
      });
    }
  }, [content, form]);

  const onSubmit = (data: z.infer<typeof homepageSchema>) => {
    updateMutation.mutate({ data }, {
      onSuccess: () => {
        toast({ title: 'Homepage content updated' });
        queryClient.invalidateQueries({ queryKey: ['/api/homepage/content'] });
      },
      onError: () => {
        toast({ title: 'Failed to update content', variant: 'destructive' });
      }
    });
  };

  if (isLoading) {
    return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900">Homepage Content</h1>
        <p className="text-gray-500 mt-1">Manage text and images shown on the landing page</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20 max-w-4xl">
          
          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="heroHeading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Headline</FormLabel>
                    <FormControl>
                      <Input placeholder="Secure Your Future..." className="text-lg font-bold" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heroSubheading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subheading</FormLabel>
                    <FormControl>
                      <Textarea placeholder="We make land ownership..." className="resize-none" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heroImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} value={field.value || ''} />
                    </FormControl>
                    {field.value && (
                      <div className="mt-4 h-48 rounded-lg overflow-hidden border border-gray-200">
                        <img src={field.value} alt="Hero Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>Company Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="mission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mission Statement</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vision Statement</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="communityImpact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Impact (CSR)</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>Performance Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="statsYearsInBusiness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years Active</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="statsPropertiesSold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plots Sold</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="statsHappyClients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Happy Clients</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="statsCountiesCovered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Counties</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 text-white px-8 h-12"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              Save Content
            </Button>
          </div>
        </form>
      </Form>
    </AdminLayout>
  );
}
