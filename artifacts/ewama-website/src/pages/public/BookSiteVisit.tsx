import { PublicLayout } from '@/components/layout/PublicLayout';
import { useCreateSiteVisit, useListProperties } from '@workspace/api-client-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, Clock, MapPin, User, Phone, Mail } from 'lucide-react';
import { useLocation } from 'wouter';

const siteVisitSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  propertyId: z.string().optional(),
  preferredDate: z.string().min(1, 'Date is required'),
  preferredTime: z.string().min(1, 'Time is required'),
});

export default function BookSiteVisit() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createVisit = useCreateSiteVisit();
  const { data: propertiesData } = useListProperties({ limit: 100, status: 'available' });

  const form = useForm<z.infer<typeof siteVisitSchema>>({
    resolver: zodResolver(siteVisitSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      propertyId: 'any',
      preferredDate: '',
      preferredTime: '',
    },
  });

  const onSubmit = (data: z.infer<typeof siteVisitSchema>) => {
    createVisit.mutate({
      data: {
        ...data,
        propertyId: data.propertyId !== 'any' ? Number(data.propertyId) : undefined,
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Booking Confirmed",
          description: "We've received your request. An advisor will contact you to confirm.",
        });
        setLocation('/');
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to submit booking. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <PublicLayout>
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            
            <div className="text-center mb-10">
              <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">Book a Site Visit</h1>
              <p className="text-gray-600 text-lg">
                Seeing is believing. Schedule a free, guided tour of our properties with one of our experienced real estate advisors. We offer free transport on selected days.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8 md:p-10">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                        <User className="w-5 h-5 text-secondary" /> Personal Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                  <Input placeholder="John Doe" className="pl-10 bg-gray-50 h-12" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                  <Input placeholder="07xx xxx xxx" className="pl-10 bg-gray-50 h-12" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                  <Input placeholder="john@example.com" className="pl-10 bg-gray-50 h-12" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-secondary" /> Visit Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="propertyId"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Property of Interest</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 bg-gray-50">
                                    <SelectValue placeholder="Select a property" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="any">I'm not sure yet (General Tour)</SelectItem>
                                  {propertiesData?.data?.map((p) => (
                                    <SelectItem key={p.id} value={p.id.toString()}>
                                      {p.name} - {p.location}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="preferredDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Date</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                  <Input type="date" className="pl-10 bg-gray-50 h-12" min={new Date().toISOString().split('T')[0]} {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="preferredTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Time</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <div className="relative">
                                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                                    <SelectTrigger className="pl-10 h-12 bg-gray-50">
                                      <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                  </div>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                                  <SelectItem value="afternoon">Afternoon (1PM - 4PM)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-medium text-lg"
                        disabled={createVisit.isPending}
                      >
                        {createVisit.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm Booking Request'}
                      </Button>
                      <p className="text-center text-sm text-gray-500 mt-4">
                        By submitting this form, you agree to our privacy policy.
                      </p>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
