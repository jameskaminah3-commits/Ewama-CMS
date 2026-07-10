import { AdminLayout } from '@/components/admin/AdminLayout';
import { useListArticles, useDeleteArticle, usePublishArticle } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Edit, Trash2, Eye, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminArticles() {
  const { data, isLoading } = useListArticles({ limit: 100 });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const deleteMutation = useDeleteArticle();
  const publishMutation = usePublishArticle();

  const handleAction = (action: any, id: number, successMsg: string) => {
    action.mutate({ id }, {
      onSuccess: () => {
        toast({ title: successMsg });
        queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      },
      onError: () => {
        toast({ title: "Action failed", variant: "destructive" });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Articles & Insights</h1>
          <p className="text-gray-500 mt-1">Manage your blog content</p>
        </div>
        <Link href="/admin/articles/new">
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
            <Plus className="w-4 h-4" /> Write Article
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[400px]">Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No articles found. Click "Write Article" to create one.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      {article.featuredImage ? (
                        <img src={article.featuredImage} alt="" className="w-10 h-10 rounded-md object-cover bg-gray-100 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-100 shrink-0" />
                      )}
                      <span className="line-clamp-1">{article.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500">{article.category || '-'}</TableCell>
                  <TableCell>
                    {article.status === 'published' ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Published</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-none">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {article.status === 'published' && article.publishedAt 
                      ? formatDate(article.publishedAt) 
                      : formatDate(article.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {article.status === 'published' && (
                          <Link href={`/articles/${article.slug}`}>
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" /> View Public
                            </DropdownMenuItem>
                          </Link>
                        )}
                        <Link href={`/admin/articles/${article.id}/edit`}>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        </Link>
                        
                        {article.status === 'draft' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50"
                              onClick={() => handleAction(publishMutation, article.id, 'Article published')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" /> Publish
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this article?')) {
                              handleAction(deleteMutation, article.id, 'Article deleted');
                            }
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
