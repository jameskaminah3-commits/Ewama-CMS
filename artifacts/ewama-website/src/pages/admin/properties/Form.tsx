import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useCreateProperty, useUpdateProperty, useGetProperty, getGetPropertyQueryKey, PropertyUpdateStatus, PropertyInputStatus } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';

const propertySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  county: z.string().min(2, 'County is required'),
  location: z.string().min(2, 'Location is required'),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  plotSize: z.string().optional(),
  cashPrice: z.coerce.number().min(0),
  installmentPrice: z.coerce.number().min(0),
  titleDeedFee: z.coerce.number().optional().nullable(),
  status: z.enum(['draft', 'available', 'coming_soon', 'sold_out', 'archived']),
  featured: z.boolean().default(false),
  heroImage: z.string().optional().nullable(),
  googleMapsLink: z.string().optional().nullable(),
  amenities: z.array(z.string()).default([]),
  investmentHighlights: z.array(z.string()).default([]),
});

export default function AdminPropertyForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const propertyId = id ? parseInt(id, 10) : 0;
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [amenityInput, setAmenityInput] = useState('');
  const [highlightInput, setHighlightInput] = useState('');

  const { data: property, isLoading } = useGetProperty(propertyId, { 
    query: { enabled: isEdit, retry: false, queryKey: getGetPropertyQueryKey(propertyId) } 
  });
  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();

  const form = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: '',
      county: '',
      location: '',
      shortDescription: '',
      fullDescription: '',
      plotSize: '50x100 ft',
      cashPrice: 0,
      installmentPrice: 0,
      titleDeedFee: null,
      status: 'draft',
      featured: false,
      heroImage: '',
      googleMapsLink: '',
      amenities: [],
      investmentHighlights: [],
    },
  });

  useEffect(() => {
    if (property && isEdit) {
      form.reset({
        name: property.name,
        county: property.county,
        location: property.location,
        shortDescription: property.shortDescription || '',
        fullDescription: property.fullDescription || '',
        plotSize: property.plotSize || '',
        cashPrice: property.cashPrice,
        installmentPrice: property.installmentPrice,
        titleDeedFee: property.titleDeedFee,
        status: property.status as any,
        featured: property.featured || false,
        heroImage: property.heroImage || '',
        googleMapsLink: property.googleMapsLink || '',
        amenities: property.amenities || [],
        investmentHighlights: property.investmentHighlights || [],
      });
    }
  }, [property, isEdit, form]);

  const addArrayItem = (field: 'amenities' | 'investmentHighlights', value: string, setValue: (v: string) => void) => {
    if (!value.trim()) return;
    const current = form.getValues(field);
    form.setValue(field, [...current, value.trim()]);
    setValue('');
  };

  const removeArrayItem = (field: 'amenities' | 'investmentHighlights', index: number) => {
    const current = form.getValues(field);
    form.setValue(field, current.filter((_, i) => i !== index));
  };

  const onSubmit = (data: z.infer<typeof propertySchema>) => {
    if (isEdit) {
      const updatePayload = {
        ...data,
        status: data.status as PropertyUpdateStatus,
        titleDeedFee: data.titleDeedFee === 0 ? null : data.titleDeedFee,
      };
      updateMutation.mutate({ id: propertyId, data: updatePayload }, {
        onSuccess: () => {
          toast({ title: 'Property updated successfully' });
          queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
          setLocation('/admin/properties');
        },
        onError: () => toast({ title: 'Error updating property', variant: 'destructive' })
      });
    } else {
      const createPayload = {
        ...data,
        status: data.status as PropertyInputStatus,
        titleDeedFee: data.titleDeedFee === 0 ? null : data.titleDeedFee,
      };
      createMutation.mutate({ data: createPayload }, {
        onSuccess: () => {
          toast({ title: 'Property created successfully' });
          queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
          setLocation('/admin/properties');
        },
        onError: () => toast({ title: 'Error creating property', variant: 'destructive' })
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
        <Link href="/admin/properties">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">
            {isEdit ? 'Edit Property' : 'Add New Property'}
          </h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              
              <Card className="shadow-sm border-gray-100">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Olive Gardens Phase 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="county"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>County</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Kiambu" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Town/Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Ruiru" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Summary</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief overview for cards" className="resize-none h-20" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fullDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Detailed description of the property..." className="min-h-[200px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-sm border-gray-100">
                <CardHeader>
                  <CardTitle>Pricing & Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="cashPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cash Price (Ksh)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="installmentPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Installment Price (Ksh)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="titleDeedFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title Deed Fee (Ksh)</FormLabel>
                          <FormControl>
                            <Input type="number" value={field.value || ''} onChange={field.onChange} />
                          </FormControl>
                          <FormDescription>Leave empty if inclusive</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="plotSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plot Size</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 50x100 ft" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="googleMapsLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google Maps Link</FormLabel>
                          <FormControl>
                            <Input placeholder="https://maps.app.goo.gl/..." value={field.value || ''} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-gray-100">
                <CardHeader>
                  <CardTitle>Features & Highlights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  
                  <div>
                    <FormLabel>Value Additions / Amenities</FormLabel>
                    <div className="flex gap-2 mt-2 mb-4">
                      <Input 
                        value={amenityInput} 
                        onChange={(e) => setAmenityInput(e.target.value)}
                        placeholder="e.g. Water and Electricity on site" 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addArrayItem('amenities', amenityInput, setAmenityInput);
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={() => addArrayItem('amenities', amenityInput, setAmenityInput)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <ul className="space-y-2">
                      {form.watch('amenities').map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md text-sm border border-gray-100">
                          {item}
                          <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700" onClick={() => removeArrayItem('amenities', idx)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <FormLabel>Investment Highlights</FormLabel>
                    <div className="flex gap-2 mt-2 mb-4">
                      <Input 
                        value={highlightInput} 
                        onChange={(e) => setHighlightInput(e.target.value)}
                        placeholder="e.g. 5 mins from bypass" 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addArrayItem('investmentHighlights', highlightInput, setHighlightInput);
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={() => addArrayItem('investmentHighlights', highlightInput, setHighlightInput)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <ul className="space-y-2">
                      {form.watch('investmentHighlights').map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md text-sm border border-gray-100">
                          {item}
                          <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700" onClick={() => removeArrayItem('investmentHighlights', idx)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>

                </CardContent>
              </Card>

            </div>

            <div className="space-y-8">
              <Card className="shadow-sm border-gray-100">
                <CardHeader>
                  <CardTitle>Status & Visibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publication Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="coming_soon">Coming Soon</SelectItem>
                            <SelectItem value="sold_out">Sold Out</SelectItem>
                            {isEdit && <SelectItem value="archived">Archived</SelectItem>}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-100 p-4 bg-gray-50">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Featured Property</FormLabel>
                          <FormDescription>
                            Show on the homepage
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-sm border-gray-100">
                <CardHeader>
                  <CardTitle>Hero Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video w-full rounded-md border-2 border-dashed border-gray-200 flex flex-col items-center justify-center bg-gray-50 overflow-hidden relative">
                    {form.watch('heroImage') ? (
                      <>
                        <img src={form.watch('heroImage')!} alt="Hero" className="w-full h-full object-cover" />
                        <Button 
                          type="button"
                          variant="secondary" 
                          size="sm" 
                          className="absolute top-2 right-2 shadow-sm"
                          onClick={() => form.setValue('heroImage', '')}
                        >
                          Change
                        </Button>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-2">Provide an image URL from the media library</p>
                      </div>
                    )}
                  </div>
                  <FormField
                    control={form.control}
                    name="heroImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Image URL" value={field.value || ''} onChange={field.onChange} />
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
                {isEdit ? 'Save Changes' : 'Create Property'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </AdminLayout>
  );
}
