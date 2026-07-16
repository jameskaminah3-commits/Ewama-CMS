import { PublicLayout } from '@/components/layout/PublicLayout';
import { PageHeader } from '@/components/PageHeader';
import { Seo } from '@/components/Seo';
import { useListArticles } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function Articles() {
  const { data: articlesData, isLoading } = useListArticles({ status: 'published', limit: 50 });
  const articles = articlesData?.data || [];

  return (
    <PublicLayout>
      <Seo
        title="Real Estate Insights"
        description="Expert advice, market trends, and guides for investing in Kenyan real estate — from the EWAMA Properties team."
      />
      <PageHeader
        kicker="Latest News"
        title="Blog & Insights"
        subtitle="Your source for market updates, property insights, and expert real estate advice."
      />

      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-6 lg:px-10 -mt-8 relative z-20 pb-24">
        {isLoading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 mt-16">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="p-6">
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-2/3 mb-4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-20 text-center mt-16">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No articles published yet</h3>
            <p className="text-gray-500">Check back later for market insights and investment guides.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 mt-16">
            {articles.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`}>
                <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer group">
                  <div className="relative h-56 bg-gray-100 overflow-hidden">
                    <img 
                      src={article.featuredImage || "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {article.category && (
                      <div className="absolute top-4 left-4 bg-secondary text-white text-xs font-bold px-3 py-1 rounded shadow-sm">
                        {article.category}
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-sm text-gray-500 mb-3">
                      {article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.updatedAt)}
                    </p>
                    <h3 className="text-xl font-heading font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                      {article.excerpt || article.content?.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...'}
                    </p>
                    <div className="flex items-center text-primary font-medium text-sm mt-auto">
                      Read Article <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
