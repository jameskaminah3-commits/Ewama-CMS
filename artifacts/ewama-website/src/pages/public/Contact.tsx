import { PublicLayout } from '@/components/layout/PublicLayout';
import { PageHeader } from '@/components/PageHeader';
import { Seo } from '@/components/Seo';
import { useGetSettings } from '@workspace/api-client-react';
import { MapPin, Phone, Mail, Clock, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateEnquiry } from '@workspace/api-client-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Please write a message'),
});

export default function Contact() {
  const { data: settings } = useGetSettings();
  const { toast } = useToast();
  const createEnquiry = useCreateEnquiry();

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const onSubmit = (data: z.infer<typeof contactSchema>) => {
    createEnquiry.mutate({
      data: {
        ...data,
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Message Sent",
          description: "Thank you for reaching out. We will get back to you shortly.",
        });
        form.reset();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <PublicLayout>
      <Seo
        title="Customer Care Centre"
        description="Let's start the conversation — call, email, WhatsApp, or visit EWAMA Properties. Honest guidance and clear answers, no pressure and no jargon."
      />
      <PageHeader
        kicker="Customer Care Centre"
        title="Let's Start the Conversation"
        subtitle="Every great investment begins with a simple conversation. No pressure, no complicated jargon — just clear answers to help you make informed decisions."
      />

      <div className="container mx-auto px-4 md:px-6 -mt-12 relative z-20 mb-24">
        <div className="grid lg:grid-cols-5 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 h-full">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-8">Talk to Us</h2>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Visit Us</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {settings?.officeAddress || 'Ewama Properties Ltd, RRW6+G44, Kiambu Road, Kiambu'}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Planning to stop by? Contact us in advance so we can give you the attention you deserve.
                    </p>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=Ewama%20Properties%20limited%2C%20RRW6%2BG44%2C%20Kiambu%20Rd%2C%20Kiambu"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-2 text-sm font-semibold text-secondary hover:text-primary transition-colors"
                    >
                      Get Directions &rarr;
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Phone Number</h3>
                    <a href={`tel:${settings?.phone || '+254720769999'}`} className="text-gray-600 hover:text-primary transition-colors block mb-1">
                      {settings?.phone || '+254 720 769 999'}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Email Address</h3>
                    <a href={`mailto:${settings?.email || 'ewamapropertiesltd@gmail.com'}`} className="text-gray-600 hover:text-primary transition-colors">
                      {settings?.email || 'ewamapropertiesltd@gmail.com'}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Business Hours</h3>
                    <p className="text-gray-600">
                      {settings?.businessHours || 'Monday - Saturday: 8:00 AM - 5:00 PM'}
                    </p>
                  </div>
                </div>
              </div>

              {settings?.whatsapp && (
                <div className="mt-12">
                  <a 
                    href={settings.whatsapp.startsWith('http') ? settings.whatsapp : `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-lg font-medium transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Chat with us on WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Send Us a Message</h2>
              <p className="text-gray-500 mb-6 text-sm">
                To help us respond efficiently, include your preferred project or location and your question or request. We'll get back to you as soon as possible.
              </p>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" className="bg-gray-50 h-12" {...field} />
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
                            <Input placeholder="john@example.com" className="bg-gray-50 h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="07xx xxx xxx" className="bg-gray-50 h-12" {...field} />
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
                            placeholder="How can we help you?"
                            className="min-h-[150px] resize-none bg-gray-50" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto px-8 h-12 bg-secondary hover:bg-secondary/90 text-white font-medium text-lg"
                    disabled={createEnquiry.isPending}
                  >
                    {createEnquiry.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Message'}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <img
              src="/office-reception.webp"
              alt="The EWAMA Properties Customer Care Centre reception in Kiambu Town"
              loading="lazy"
              className="w-full h-[400px] object-cover"
            />
            <p className="text-sm text-gray-500 text-center py-3 border-t border-gray-100">
              Our Customer Care Centre — we look forward to welcoming you.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <iframe
              title="EWAMA Properties office location"
              src="https://maps.google.com/maps?q=-1.1537477,36.8103259&z=17&output=embed"
              className="w-full h-[400px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <p className="text-sm text-gray-500 text-center py-3 border-t border-gray-100">
              Ewama Properties Ltd, Kiambu Road, Kiambu
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
