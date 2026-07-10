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

// Admin Pages
import AdminLogin from '@/pages/admin/Login';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminProperties from '@/pages/admin/properties/List';
import AdminPropertyForm from '@/pages/admin/properties/Form';
import AdminArticles from '@/pages/admin/articles/List';
import AdminArticleForm from '@/pages/admin/articles/Form';
import AdminEnquiries from '@/pages/admin/Enquiries';
import AdminSiteVisits from '@/pages/admin/SiteVisits';
import AdminSettings from '@/pages/admin/Settings';
import AdminMedia from '@/pages/admin/Media';
import AdminHomepage from '@/pages/admin/Homepage';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/properties" component={Properties} />
      <Route path="/properties/:slug" component={PropertyDetail} />
      <Route path="/about" component={About} />
      <Route path="/articles" component={Articles} />
      <Route path="/articles/:slug" component={ArticleDetail} />
      <Route path="/contact" component={Contact} />
      <Route path="/book-site-visit" component={BookSiteVisit} />

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
