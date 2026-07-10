import { AdminLayout } from '@/components/admin/AdminLayout';
import { useListEnquiries, useUpdateEnquiry, useExportEnquiries } from '@workspace/api-client-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, Download, Mail, Phone, Clock, MessageSquare, Save } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminEnquiries() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [notes, setNotes] = useState('');
  
  const { data, isLoading } = useListEnquiries({ 
    limit: 100,
    status: statusFilter !== 'all' ? statusFilter as any : undefined
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateMutation = useUpdateEnquiry();

  const handleStatusChange = (id: number, status: string) => {
    updateMutation.mutate({ id, data: { status: status as any } }, {
      onSuccess: () => {
        toast({ title: 'Status updated' });
        queryClient.invalidateQueries({ queryKey: ['/api/enquiries'] });
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry({...selectedEnquiry, status});
        }
      }
    });
  };

  const handleSaveNotes = () => {
    if (!selectedEnquiry) return;
    updateMutation.mutate({ id: selectedEnquiry.id, data: { notes } }, {
      onSuccess: () => {
        toast({ title: 'Notes saved' });
        queryClient.invalidateQueries({ queryKey: ['/api/enquiries'] });
        setSelectedEnquiry({...selectedEnquiry, notes});
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread': return <Badge className="bg-red-100 text-red-800 border-none">New / Unread</Badge>;
      case 'read': return <Badge className="bg-blue-100 text-blue-800 border-none">Read</Badge>;
      case 'contacted': return <Badge className="bg-yellow-100 text-yellow-800 border-none">Contacted</Badge>;
      case 'closed': return <Badge className="bg-gray-100 text-gray-800 border-none">Closed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const openEnquiry = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setNotes(enquiry.notes || '');
    if (enquiry.status === 'unread') {
      handleStatusChange(enquiry.id, 'read');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Enquiries Inbox</h1>
          <p className="text-gray-500 mt-1">Manage leads and customer messages</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Enquiries</SelectItem>
              <SelectItem value="unread">Unread Only</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No enquiries found.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((enquiry) => (
                <TableRow 
                  key={enquiry.id} 
                  className={`cursor-pointer ${enquiry.status === 'unread' ? 'bg-blue-50/30' : ''}`}
                  onClick={() => openEnquiry(enquiry)}
                >
                  <TableCell>
                    <div className="font-medium text-gray-900">{enquiry.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <Mail className="w-3 h-3" /> {enquiry.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {enquiry.propertyName ? (
                      <span className="text-primary font-medium">{enquiry.propertyName}</span>
                    ) : (
                      <span className="text-gray-500 italic">General Enquiry</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(enquiry.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(enquiry.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedEnquiry} onOpenChange={(open) => !open && setSelectedEnquiry(null)}>
        {selectedEnquiry && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between pr-8">
                <DialogTitle className="text-xl">Enquiry Details</DialogTitle>
                <Select 
                  value={selectedEnquiry.status} 
                  onValueChange={(val) => handleStatusChange(selectedEnquiry.id, val)}
                >
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogDescription>
                Received on {new Date(selectedEnquiry.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <p className="font-medium">{selectedEnquiry.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Interest</p>
                <p className="font-medium text-primary">{selectedEnquiry.propertyName || 'General'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <a href={`mailto:${selectedEnquiry.email}`} className="font-medium text-blue-600 hover:underline flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {selectedEnquiry.email}
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                {selectedEnquiry.phone ? (
                  <a href={`tel:${selectedEnquiry.phone}`} className="font-medium text-blue-600 hover:underline flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {selectedEnquiry.phone}
                  </a>
                ) : (
                  <span className="text-gray-400 italic">Not provided</span>
                )}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400" /> Message
              </p>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap text-sm border border-gray-100">
                {selectedEnquiry.message}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Internal Admin Notes</p>
              <div className="flex gap-2">
                <Textarea 
                  placeholder="Add notes about this enquiry..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>
              <div className="flex justify-end mt-2">
                <Button 
                  size="sm" 
                  onClick={handleSaveNotes}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Notes</>}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </AdminLayout>
  );
}
