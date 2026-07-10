import { PublicLayout } from '@/components/layout/PublicLayout';
import { useListArticles } from '@workspace/api-client-react'; // Orval doesn't have useGetArticleBySlug yet, we'll fetch list and filter
import { useParams, Link } from 'wouter';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, User, Calendar } from 'lucide-react';
import NotFound from '../not-found';

export default function ArticleDetail() {
  const { slug } = useParams();
  const { data: articlesData, isLoading } = useListArticles({ status: 'published', limit: 100 });
  
  const article = articlesData?.data?.find(a => a.slug === slug);

  if (!isLoading && !article) {
    return <NotFound />;
  }

  return (
    <PublicLayout>
      {isLoading ? (
        <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/3 mb-10" />
          <Skeleton className="h-[400px] w-full rounded-2xl mb-12" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ) : article ? (
        <article className="pb-24">
          <div className="bg-gray-50 py-12 border-b border-gray-100">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
              <Link href="/articles">
                <span className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors cursor-pointer mb-8">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Insights
                </span>
              </Link>
              
              {article.category && (
                <span className="inline-block bg-secondary/10 text-secondary text-sm font-bold px-3 py-1 rounded-full mb-4">
                  {article.category}
                </span>
              )}
              
              <h1 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 leading-tight mb-6">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {article.author || 'EWAMA Properties'}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.updatedAt)}
                </div>
                {article.readingTime && (
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    {article.readingTime} min read
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 md:px-6 max-w-4xl py-12">
            {article.featuredImage && (
              <img 
                src={article.featuredImage} 
                alt={article.title}
                className="w-full h-auto max-h-[500px] object-cover rounded-2xl mb-12 shadow-sm"
              />
            )}
            
            {article.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed font-medium mb-10 border-l-4 border-secondary pl-6">
                {article.excerpt}
              </p>
            )}

            <div 
              className="prose prose-lg md:prose-xl max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-secondary hover:prose-a:text-primary prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: article.content || '' }}
            />
          </div>
        </article>
      ) : null}
    </PublicLayout>
  );
}
