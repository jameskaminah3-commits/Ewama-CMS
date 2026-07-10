import { AdminLayout } from '@/components/admin/AdminLayout';
import { useListProperties, useDeleteProperty, usePublishProperty, useArchiveProperty, useDuplicateProperty } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Edit, Trash2, Eye, Copy, Archive, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminProperties() {
  const { data, isLoading } = useListProperties({ limit: 100 });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const deleteMutation = useDeleteProperty();
  const publishMutation = usePublishProperty();
  const archiveMutation = useArchiveProperty();
  const duplicateMutation = useDuplicateProperty();

  const handleAction = (action: any, id: number, successMsg: string) => {
    action.mutate({ id }, {
      onSuccess: () => {
        toast({ title: successMsg });
        queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      },
      onError: () => {
        toast({ title: "Action failed", variant: "destructive" });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Available</Badge>;
      case 'draft': return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-none">Draft</Badge>;
      case 'coming_soon': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">Coming Soon</Badge>;
      case 'sold_out': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Sold Out</Badge>;
      case 'archived': return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-none">Archived</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Properties</h1>
          <p className="text-gray-500 mt-1">Manage your land portfolio</p>
        </div>
        <Link href="/admin/properties/new">
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
            <Plus className="w-4 h-4" /> Add Property
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[300px]">Property Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No properties found. Click "Add Property" to create one.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      {property.heroImage ? (
                        <img src={property.heroImage} alt="" className="w-10 h-10 rounded-md object-cover bg-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-100" />
                      )}
                      <div>
                        <div>{property.name}</div>
                        {property.featured && <span className="text-[10px] uppercase font-bold text-secondary">Featured</span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500">{property.location}, {property.county}</TableCell>
                  <TableCell className="text-gray-900 font-medium">{formatCurrency(property.cashPrice)}</TableCell>
                  <TableCell>{getStatusBadge(property.status)}</TableCell>
                  <TableCell className="text-gray-500">{formatDate(property.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/properties/${property.slug}`}>
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> View Public
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`/admin/properties/${property.id}/edit`}>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => handleAction(duplicateMutation, property.id, 'Property duplicated')}
                        >
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        {property.status === 'draft' && (
                          <DropdownMenuItem 
                            className="cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50"
                            onClick={() => handleAction(publishMutation, property.id, 'Property published')}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Publish
                          </DropdownMenuItem>
                        )}
                        {property.status !== 'archived' && (
                          <DropdownMenuItem 
                            className="cursor-pointer text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                            onClick={() => handleAction(archiveMutation, property.id, 'Property archived')}
                          >
                            <Archive className="mr-2 h-4 w-4" /> Archive
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this property? This cannot be undone.')) {
                              handleAction(deleteMutation, property.id, 'Property deleted');
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
