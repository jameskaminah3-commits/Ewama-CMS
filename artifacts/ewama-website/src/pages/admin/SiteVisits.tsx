import { AdminLayout } from '@/components/admin/AdminLayout';
import { useListSiteVisits, useUpdateSiteVisit } from '@workspace/api-client-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, Calendar, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminSiteVisits() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [notes, setNotes] = useState('');
  
  const { data, isLoading } = useListSiteVisits({ 
    limit: 100,
    status: statusFilter !== 'all' ? statusFilter as any : undefined
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateMutation = useUpdateSiteVisit();

  const handleStatusChange = (id: number, status: string) => {
    updateMutation.mutate({ id, data: { status: status as any } }, {
      onSuccess: () => {
        toast({ title: 'Status updated' });
        queryClient.invalidateQueries({ queryKey: ['/api/site-visits'] });
        if (selectedVisit && selectedVisit.id === id) {
          setSelectedVisit({...selectedVisit, status});
        }
      }
    });
  };

  const handleSaveNotes = () => {
    if (!selectedVisit) return;
    updateMutation.mutate({ id: selectedVisit.id, data: { adminNotes: notes } }, {
      onSuccess: () => {
        toast({ title: 'Notes saved' });
        queryClient.invalidateQueries({ queryKey: ['/api/site-visits'] });
        setSelectedVisit({...selectedVisit, adminNotes: notes});
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 border-none">Pending</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-800 border-none">Approved</Badge>;
      case 'completed': return <Badge className="bg-blue-100 text-blue-800 border-none">Completed</Badge>;
      case 'rescheduled': return <Badge className="bg-orange-100 text-orange-800 border-none">Rescheduled</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800 border-none">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const openVisit = (visit: any) => {
    setSelectedVisit(visit);
    setNotes(visit.adminNotes || '');
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Site Visits</h1>
          <p className="text-gray-500 mt-1">Manage property tour bookings</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Date / Time</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No site visits found.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((visit) => (
                <TableRow 
                  key={visit.id} 
                  className={`cursor-pointer hover:bg-gray-50`}
                  onClick={() => openVisit(visit)}
                >
                  <TableCell>
                    <div className="font-medium text-primary">{formatDate(visit.preferredDate)}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1 capitalize">
                      <Clock className="w-3 h-3" /> {visit.preferredTime || 'Any time'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{visit.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <Phone className="w-3 h-3" /> {visit.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    {visit.propertyName ? (
                      <span className="font-medium text-gray-700">{visit.propertyName}</span>
                    ) : (
                      <span className="text-gray-500 italic">General Tour</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(visit.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Manage</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedVisit} onOpenChange={(open) => !open && setSelectedVisit(null)}>
        {selectedVisit && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between pr-8">
                <DialogTitle className="text-xl">Booking Details</DialogTitle>
                <Select 
                  value={selectedVisit.status} 
                  onValueChange={(val) => handleStatusChange(selectedVisit.id, val)}
                >
                  <SelectTrigger className="w-[140px] h-8 text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approve Tour</SelectItem>
                    <SelectItem value="completed">Mark Completed</SelectItem>
                    <SelectItem value="rescheduled">Reschedule</SelectItem>
                    <SelectItem value="rejected">Reject/Cancel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogDescription>
                Submitted on {new Date(selectedVisit.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-primary/5 rounded-xl p-6 my-4 border border-primary/10">
              <div className="flex items-center gap-3 text-primary mb-2">
                <Calendar className="w-5 h-5" />
                <h3 className="font-heading font-bold text-lg">
                  {formatDate(selectedVisit.preferredDate)}
                </h3>
                <span className="mx-2 text-primary/30">|</span>
                <Clock className="w-5 h-5" />
                <h3 className="font-heading font-bold text-lg capitalize">
                  {selectedVisit.preferredTime || 'Flexible Time'}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-4 text-gray-700 font-medium">
                <MapPin className="w-4 h-4 text-secondary" />
                Target: {selectedVisit.propertyName || 'General Portfolio Tour'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 py-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Client Name</p>
                <p className="font-medium text-gray-900">{selectedVisit.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                <a href={`tel:${selectedVisit.phone}`} className="font-medium text-blue-600 hover:underline flex items-center gap-1">
                  <Phone className="w-4 h-4" /> {selectedVisit.phone}
                </a>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 mb-1">Email Address</p>
                <a href={`mailto:${selectedVisit.email}`} className="font-medium text-blue-600 hover:underline flex items-center gap-1">
                  <Mail className="w-4 h-4" /> {selectedVisit.email}
                </a>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-900 mb-2">Admin Notes (Not visible to client)</p>
              <div className="flex flex-col gap-3">
                <Textarea 
                  placeholder="Transport arrangements, specific plots to show, etc." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <Button 
                  onClick={handleSaveNotes}
                  disabled={updateMutation.isPending}
                  className="self-end"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Notes'}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </AdminLayout>
  );
}
