import { useGetDashboardStats, useGetRecentActivity } from '@workspace/api-client-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, FileText, MessageSquare, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your website's performance</p>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Properties</CardTitle>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <MapPin className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats?.totalProperties?.toLocaleString() || 0}</div>
                <div className="text-xs text-gray-500 mt-1">{stats?.availableProperties || 0} available</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-secondary shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Published Articles</CardTitle>
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                  <FileText className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats?.publishedArticles?.toLocaleString() || 0}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Unread Enquiries</CardTitle>
                <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats?.unreadEnquiries?.toLocaleString() || 0}</div>
                <Link href="/admin/enquiries" className="text-xs text-blue-600 font-medium hover:underline mt-1 inline-flex items-center gap-1">
                  View Inbox <ArrowRight className="w-3 h-3" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pending Site Visits</CardTitle>
                <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500">
                  <Calendar className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats?.pendingSiteVisits?.toLocaleString() || 0}</div>
                <Link href="/admin/site-visits" className="text-xs text-orange-600 font-medium hover:underline mt-1 inline-flex items-center gap-1">
                  View Calendar <ArrowRight className="w-3 h-3" />
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-heading">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : activity?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No recent activity</div>
              ) : (
                <div className="space-y-6">
                  {activity?.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-2 h-2 mt-2 rounded-full bg-gray-300 shrink-0" />
                      <div>
                        <p className="text-sm text-gray-900">
                          {item.description}
                          {item.entityTitle && <span className="font-medium ml-1">"{item.entityTitle}"</span>}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(item.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-heading">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/properties/new">
                <div className="w-full flex items-center justify-between p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100">
                  <span className="font-medium text-sm text-gray-700">Add New Property</span>
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
              <Link href="/admin/articles/new">
                <div className="w-full flex items-center justify-between p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100">
                  <span className="font-medium text-sm text-gray-700">Write Article</span>
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
              <Link href="/admin/media">
                <div className="w-full flex items-center justify-between p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100">
                  <span className="font-medium text-sm text-gray-700">Upload Media</span>
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
