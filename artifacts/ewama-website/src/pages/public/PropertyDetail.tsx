import { useGetPropertyBySlug, useCreateEnquiry } from '@workspace/api-client-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Seo } from '@/components/Seo';
import { ImageLightbox } from '@/components/ImageLightbox';
import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { MapPin, Check, FileText, ChevronRight, Phone, Calendar, ArrowLeft, Loader2, Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import NotFound from '../not-found';

const enquirySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Please write a message'),
});

export default function PropertyDetail() {
  const { slug } = useParams();
  const { data: property, isLoading, error } = useGetPropertyBySlug(slug || '');
  const { toast } = useToast();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  const createEnquiry = useCreateEnquiry();

  const form = useForm<z.infer<typeof enquirySchema>>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: 'I am interested in this property and would like more information.',
    },
  });

  if (error) {
    return <NotFound />;
  }

  const onSubmit = (data: z.infer<typeof enquirySchema>) => {
    if (!property) return;
    
    createEnquiry.mutate({
      data: {
        ...data,
        propertyId: property.id,
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Enquiry Sent",
          description: "We'll get back to you shortly.",
        });
        form.reset();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to send enquiry. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-[400px] md:h-[600px] w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div>
              <Skeleton className="h-[500px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!property) return null;

  const heroImage = property.heroImage || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80";
  const allImages = [heroImage, ...(property.gallery || []).filter(img => img !== heroImage)];

  return (
    <PublicLayout>
      <Seo
        title={`${property.name} — ${property.location}, ${property.county}`}
        description={property.shortDescription || `Land for sale in ${property.location}, ${property.county}. Cash price from ${formatCurrency(property.cashPrice)}.`}
        image={property.heroImage}
      />
      <div className="bg-gray-50 py-4 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/properties">
              <span className="hover:text-primary transition-colors cursor-pointer flex items-center">
                <ArrowLeft className="w-4 h-4 mr-1" /> Properties
              </span>
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900 font-medium truncate">{property.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div
              className="group/hero rounded-2xl overflow-hidden bg-gray-100 h-[400px] md:h-[600px] mb-8 relative cursor-zoom-in"
              onClick={() => setLightboxIndex(0)}
            >
              <img
                src={heroImage}
                alt={property.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="bg-secondary text-white text-sm font-bold px-4 py-2 rounded-md shadow-md uppercase tracking-wide">
                  {property.status === 'available' ? 'Available' : property.status.replace('_', ' ')}
                </div>
              </div>
              <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/50 text-white text-sm px-3 py-2 rounded-md backdrop-blur-sm opacity-0 group-hover/hero:opacity-100 transition-opacity">
                <Expand className="w-4 h-4" />
                View photos{allImages.length > 1 ? ` (${allImages.length})` : ''}
              </div>
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-4 mb-8 overflow-x-auto pb-4 snap-x">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className="w-32 h-24 rounded-lg overflow-hidden shrink-0 snap-start bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary"
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img src={img} alt={`${property.name} photo ${idx+1}`} loading="lazy" className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

            <ImageLightbox
              images={allImages}
              alt={property.name}
              openIndex={lightboxIndex}
              onOpenChange={setLightboxIndex}
            />

            <div className="mb-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-secondary font-medium mb-3">
                    <MapPin className="w-5 h-5" />
                    {property.location}, {property.county}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 leading-tight">
                    {property.name}
                  </h1>
                </div>
                <div className="text-left md:text-right bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <p className="text-sm text-gray-500 mb-1">Starting from</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(property.cashPrice)}
                  </p>
                  {property.plotSize && (
                    <p className="text-sm text-gray-600 mt-1 font-medium bg-white px-2 py-1 rounded inline-block">Size: {property.plotSize}</p>
                  )}
                </div>
              </div>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p className="lead text-xl text-gray-700">{property.shortDescription}</p>
                {property.fullDescription && (
                  <div dangerouslySetInnerHTML={{ __html: property.fullDescription.replace(/\n/g, '<br/>') }} />
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {property.investmentHighlights && property.investmentHighlights.length > 0 && (
                <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
                  <h3 className="text-xl font-heading font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    Investment Highlights
                  </h3>
                  <ul className="space-y-4">
                    {property.investmentHighlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-secondary shrink-0" />
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {property.amenities && property.amenities.length > 0 && (
                <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
                  <h3 className="text-xl font-heading font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                    Value Additions
                  </h3>
                  <ul className="space-y-4">
                    {property.amenities.map((amenity, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-gray-700">{amenity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-primary text-white p-8 rounded-xl mb-12">
              <h3 className="text-2xl font-heading font-bold mb-6">Pricing Options</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-sm">
                  <h4 className="text-lg font-medium text-white/80 mb-2">Cash Offer</h4>
                  <p className="text-3xl font-bold">{formatCurrency(property.cashPrice)}</p>
                  <p className="text-sm text-white/60 mt-2">Payable within 30 days</p>
                </div>
                {property.installmentPrice && (
                  <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                    <h4 className="text-lg font-medium text-white/80 mb-2">Installment Plan</h4>
                    <p className="text-3xl font-bold">{formatCurrency(property.installmentPrice)}</p>
                    <p className="text-sm text-white/60 mt-2">Flexible monthly payments</p>
                  </div>
                )}
              </div>
              {property.titleDeedFee && (
                <div className="mt-6 flex items-center gap-3 bg-white/5 p-4 rounded-lg">
                  <FileText className="w-6 h-6 text-secondary" />
                  <div>
                    <p className="font-medium">Title Deed Transfer Fee</p>
                    <p className="text-secondary font-bold">{formatCurrency(property.titleDeedFee)}</p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar / Enquiry Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="shadow-lg border-gray-100 overflow-hidden">
                <div className="bg-primary p-6 text-center">
                  <h3 className="text-2xl font-heading font-bold text-white mb-2">Interested?</h3>
                  <p className="text-white/80 text-sm">Send us a message and our property advisors will get in touch.</p>
                </div>
                <CardContent className="p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" className="bg-gray-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="john@example.com" className="bg-gray-50" {...field} />
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
                              <Input placeholder="07xx xxx xxx" className="bg-gray-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                className="min-h-[100px] resize-none bg-gray-50" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white font-medium text-lg mt-2"
                        disabled={createEnquiry.isPending}
                      >
                        {createEnquiry.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Enquiry'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-4">
                <Link href="/book-site-visit">
                  <Button variant="outline" className="w-full h-12 flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                    <Calendar className="w-5 h-5" />
                    Book a Site Visit
                  </Button>
                </Link>
                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">Or call us directly</p>
                  <a href="tel:0720769999" className="text-2xl font-bold text-primary flex items-center justify-center gap-2 hover:text-secondary transition-colors">
                    <Phone className="w-6 h-6" /> 0720 769 999
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}
