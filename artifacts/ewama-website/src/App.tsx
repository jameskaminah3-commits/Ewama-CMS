import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/lib/auth';

// Pages
import Home from '@/pages/public/Home';
import Properties from '@/pages/public/Properties';
import PropertyDetail from '@/pages/public/PropertyDetail';
import About from '@/pages/public/About';
import Articles from '@/pages/public/Articles';
import ArticleDetail from '@/pages/public/ArticleDetail';
import Contact from '@/pages/public/Contact';
import BookSiteVisit from '@/pages/public/BookSiteVisit';
import PrivacyPolicy from '@/pages/public/PrivacyPolicy';
import TermsOfService from '@/pages/public/TermsOfService';
import Faq from '@/pages/public/Faq';
import Communities from '@/pages/public/Communities';

// Admin Pages — lazy-loaded so public visitors never download the dashboard
// code; each chunk is fetched on first visit to an /admin route.
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
const AdminLogin = lazy(() => import('@/pages/admin/Login'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminProperties = lazy(() => import('@/pages/admin/properties/List'));
const AdminPropertyForm = lazy(() => import('@/pages/admin/properties/Form'));
const AdminArticles = lazy(() => import('@/pages/admin/articles/List'));
const AdminArticleForm = lazy(() => import('@/pages/admin/articles/Form'));
const AdminEnquiries = lazy(() => import('@/pages/admin/Enquiries'));
const AdminSiteVisits = lazy(() => import('@/pages/admin/SiteVisits'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));
const AdminMedia = lazy(() => import('@/pages/admin/Media'));
const AdminHomepage = lazy(() => import('@/pages/admin/Homepage'));

const queryClient = new QueryClient();

function Router() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/properties" component={Properties} />
      <Route path="/properties/:slug" component={PropertyDetail} />
      <Route path="/about" component={About} />
      <Route path="/articles" component={Articles} />
      <Route path="/articles/:slug" component={ArticleDetail} />
      <Route path="/contact" component={Contact} />
      <Route path="/book-site-visit" component={BookSiteVisit} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/faq" component={Faq} />
      <Route path="/communities" component={Communities} />

      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/properties" component={AdminProperties} />
      <Route path="/admin/properties/new" component={AdminPropertyForm} />
      <Route path="/admin/properties/:id/edit" component={AdminPropertyForm} />
      <Route path="/admin/articles" component={AdminArticles} />
      <Route path="/admin/articles/new" component={AdminArticleForm} />
      <Route path="/admin/articles/:id/edit" component={AdminArticleForm} />
      <Route path="/admin/enquiries" component={AdminEnquiries} />
      <Route path="/admin/site-visits" component={AdminSiteVisits} />
      <Route path="/admin/media" component={AdminMedia} />
      <Route path="/admin/homepage" component={AdminHomepage} />
      <Route path="/admin/settings" component={AdminSettings} />

      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
