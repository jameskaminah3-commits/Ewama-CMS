import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useCreateArticle, useUpdateArticle, useGetArticle, getGetArticleQueryKey } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';

const articleSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  category: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  status: z.enum(['draft', 'published']),
  featuredImage: z.string().optional().nullable(),
});

export default function AdminArticleForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const articleId = id ? parseInt(id, 10) : 0;
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: article, isLoading } = useGetArticle(articleId, { 
    query: { enabled: isEdit, retry: false, queryKey: getGetArticleQueryKey(articleId) } 
  });
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();

  const form = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      category: '',
      excerpt: '',
      content: '',
      status: 'draft',
      featuredImage: '',
    },
  });

  useEffect(() => {
    if (article && isEdit) {
      form.reset({
        title: article.title,
        category: article.category || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        status: article.status as any,
        featuredImage: article.featuredImage || '',
      });
    }
  }, [article, isEdit, form]);

  const onSubmit = (data: z.infer<typeof articleSchema>) => {
    if (isEdit) {
      updateMutation.mutate({ id: articleId, data }, {
        onSuccess: () => {
          toast({ title: 'Article updated successfully' });
          queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
          setLocation('/admin/articles');
        },
        onError: () => toast({ title: 'Error updating article', variant: 'destructive' })
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          toast({ title: 'Article created successfully' });
          queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
          setLocation('/admin/articles');
        },
        onError: () => toast({ title: 'Error creating article', variant: 'destructive' })
      });
    }
  };

  if (isEdit && isLoading) {
    return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AdminLayout>;
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/articles">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">
            {isEdit ? 'Edit Article' : 'Write New Article'}
          </h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              
              <Card className="shadow-sm border-gray-100">
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter article title" className="text-lg font-medium h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt (Summary)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief summary for the blog listing..." className="resize-none h-20" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Content</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Write your article here... (HTML supported)" className="min-h-[400px] font-mono text-sm" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

            </div>

            <div className="space-y-8">
              <Card className="shadow-sm border-gray-100">
                <CardHeader>
                  <CardTitle>Publishing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Investment Tips" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-sm border-gray-100">
                <CardHeader>
                  <CardTitle>Featured Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video w-full rounded-md border-2 border-dashed border-gray-200 flex flex-col items-center justify-center bg-gray-50 overflow-hidden relative">
                    {form.watch('featuredImage') ? (
                      <>
                        <img src={form.watch('featuredImage')!} alt="Hero" className="w-full h-full object-cover" />
                        <Button 
                          type="button"
                          variant="secondary" 
                          size="sm" 
                          className="absolute top-2 right-2 shadow-sm"
                          onClick={() => form.setValue('featuredImage', '')}
                        >
                          Change
                        </Button>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-2">Image URL</p>
                      </div>
                    )}
                  </div>
                  <FormField
                    control={form.control}
                    name="featuredImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="https://..." value={field.value || ''} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg font-medium"
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Publish Article'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </AdminLayout>
  );
}
