import { AdminLayout } from '@/components/admin/AdminLayout';
import { MediaPickerDialog } from '@/components/admin/MediaPickerDialog';
import { useGetHomepageContent, useUpdateHomepageContent, getGetHomepageContentQueryKey } from '@workspace/api-client-react';
import { useForm, useFieldArray, Control, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const cardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
});

const testimonialSchema = z.object({
  quote: z.string().min(1, 'Quote is required'),
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
});

// Only the photo is required — a slide can be just a clean picture with no
// label, headline, text, or button. Empty fields simply aren't shown.
const heroSlideSchema = z.object({
  kicker: z.string().optional().default(''),
  title: z.string().optional().default(''),
  text: z.string().optional().default(''),
  image: z.string().min(1, 'Please choose a photo for this slide'),
  ctaLabel: z.string().optional().default(''),
  ctaHref: z.string().optional().default(''),
});

const homepageSchema = z.object({
  heroBadge: z.string().optional().nullable(),
  heroHeading: z.string().optional().nullable(),
  heroSubheading: z.string().optional().nullable(),
  heroImage: z.string().optional().nullable(),
  mission: z.string().optional().nullable(),
  vision: z.string().optional().nullable(),
  communityImpact: z.string().optional().nullable(),
  statsYearsInBusiness: z.coerce.number().optional().nullable(),
  statsPropertiesSold: z.coerce.number().optional().nullable(),
  statsHappyClients: z.coerce.number().optional().nullable(),
  statsCountiesCovered: z.coerce.number().optional().nullable(),
  ctaHeading: z.string().optional().nullable(),
  ctaSubheading: z.string().optional().nullable(),
  advantages: z.array(cardSchema),
  processSteps: z.array(cardSchema),
  testimonials: z.array(testimonialSchema),
  heroSlides: z.array(heroSlideSchema),
  approachText: z.string().optional().nullable(),
  approachQuote: z.string().optional().nullable(),
  whatYouGet: z.array(z.string()),
});

type HomepageForm = z.infer<typeof homepageSchema>;

function HeroSlidesEditor({ form }: { form: UseFormReturn<HomepageForm> }) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'heroSlides' });
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        These are the rotating banners at the top of the homepage. <strong>Only the photo is required.</strong> Leave the label, headline, text, and button empty for a clean picture-only slide, or fill them in to show text over the photo.
      </p>
      {fields.map((item, index) => (
        <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">Slide {index + 1}</p>
            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => remove(index)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name={`heroSlides.${index}.kicker`} render={({ field }) => (
              <FormItem>
                <FormLabel>Small Label (optional)</FormLabel>
                <FormControl><Input placeholder="EWAMA PROPERTIES LTD" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name={`heroSlides.${index}.title`} render={({ field }) => (
              <FormItem>
                <FormLabel>Headline (optional)</FormLabel>
                <FormControl><Input placeholder="Own Today. Prosper Tomorrow." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name={`heroSlides.${index}.text`} render={({ field }) => (
            <FormItem>
              <FormLabel>Supporting Text (optional)</FormLabel>
              <FormControl><Textarea className="resize-none" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <FormField control={form.control} name={`heroSlides.${index}.image`} render={({ field }) => (
                <FormItem>
                  <FormLabel>Background Photo</FormLabel>
                  <FormControl><Input placeholder="Pick from Media Library or paste a URL" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <Button type="button" variant="outline" className="gap-2 shrink-0" onClick={() => setPickerIndex(index)}>
              <ImageIcon className="w-4 h-4" /> Choose
            </Button>
          </div>
          {form.watch(`heroSlides.${index}.image`) && (
            <div className="h-28 rounded-lg overflow-hidden border border-gray-200">
              <img src={form.watch(`heroSlides.${index}.image`)} alt="Slide preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name={`heroSlides.${index}.ctaLabel`} render={({ field }) => (
              <FormItem>
                <FormLabel>Button Label (optional)</FormLabel>
                <FormControl><Input placeholder="Explore Properties" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name={`heroSlides.${index}.ctaHref`} render={({ field }) => (
              <FormItem>
                <FormLabel>Button Link (optional)</FormLabel>
                <FormControl><Input placeholder="/properties" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        onClick={() => append({ kicker: 'EWAMA PROPERTIES LTD', title: '', text: '', image: '', ctaLabel: 'Explore Properties', ctaHref: '/properties' })}
      >
        <Plus className="w-4 h-4" /> Add Slide
      </Button>

      <MediaPickerDialog
        open={pickerIndex !== null}
        onOpenChange={(open) => !open && setPickerIndex(null)}
        title="Choose a slide photo"
        onSelect={(url) => {
          if (pickerIndex !== null) form.setValue(`heroSlides.${pickerIndex}.image`, url);
        }}
      />
    </div>
  );
}

function WhatYouGetEditor({ form }: { form: UseFormReturn<HomepageForm> }) {
  const [input, setInput] = useState('');
  const items = form.watch('whatYouGet');

  const add = () => {
    if (!input.trim()) return;
    form.setValue('whatYouGet', [...form.getValues('whatYouGet'), input.trim()]);
    setInput('');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">The checklist shown beside the statistics ("What You Get").</p>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Transparent pricing"
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <Button type="button" variant="secondary" onClick={add}><Plus className="w-4 h-4" /></Button>
      </div>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md text-sm border border-gray-100">
            {item}
            <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              onClick={() => form.setValue('whatYouGet', form.getValues('whatYouGet').filter((_, i) => i !== idx))}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CardListEditor({ control, name, itemLabel }: { control: Control<HomepageForm>; name: 'advantages' | 'processSteps'; itemLabel: string }) {
  const { fields, append, remove } = useFieldArray({ control, name });
  return (
    <div className="space-y-4">
      {fields.map((item, index) => (
        <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">{itemLabel} {index + 1}</p>
            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => remove(index)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <FormField
            control={control}
            name={`${name}.${index}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea className="resize-none" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
      <Button type="button" variant="outline" className="gap-2" onClick={() => append({ title: '', description: '' })}>
        <Plus className="w-4 h-4" /> Add {itemLabel}
      </Button>
    </div>
  );
}

function TestimonialListEditor({ control }: { control: Control<HomepageForm> }) {
  const { fields, append, remove } = useFieldArray({ control, name: 'testimonials' });
  return (
    <div className="space-y-4">
      {fields.map((item, index) => (
        <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">Testimonial {index + 1}</p>
            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => remove(index)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <FormField
            control={control}
            name={`testimonials.${index}.quote`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quote</FormLabel>
                <FormControl><Textarea className="resize-none" placeholder="What the client said..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`testimonials.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl><Input placeholder="Jane W., Nairobi" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`testimonials.${index}.role`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detail Line</FormLabel>
                  <FormControl><Input placeholder="Plot owner since 2023" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" className="gap-2" onClick={() => append({ quote: '', name: '', role: '' })}>
        <Plus className="w-4 h-4" /> Add Testimonial
      </Button>
    </div>
  );
}

export default function AdminHomepage() {
  const { data: content, isLoading } = useGetHomepageContent();
  const updateMutation = useUpdateHomepageContent();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<HomepageForm>({
    resolver: zodResolver(homepageSchema),
    defaultValues: {
      heroBadge: '',
      heroHeading: '',
      heroSubheading: '',
      heroImage: '',
      mission: '',
      vision: '',
      communityImpact: '',
      statsYearsInBusiness: 0,
      statsPropertiesSold: 0,
      statsHappyClients: 0,
      statsCountiesCovered: 0,
      ctaHeading: '',
      ctaSubheading: '',
      advantages: [],
      processSteps: [],
      testimonials: [],
      heroSlides: [],
      approachText: '',
      approachQuote: '',
      whatYouGet: [],
    },
  });

  useEffect(() => {
    if (content) {
      form.reset({
        heroBadge: content.heroBadge || '',
        heroHeading: content.heroHeading || '',
        heroSubheading: content.heroSubheading || '',
        heroImage: content.heroImage || '',
        mission: content.mission || '',
        vision: content.vision || '',
        communityImpact: content.communityImpact || '',
        statsYearsInBusiness: content.statsYearsInBusiness || 0,
        statsPropertiesSold: content.statsPropertiesSold || 0,
        statsHappyClients: content.statsHappyClients || 0,
        statsCountiesCovered: content.statsCountiesCovered || 0,
        ctaHeading: content.ctaHeading || '',
        ctaSubheading: content.ctaSubheading || '',
        advantages: content.advantages || [],
        processSteps: content.processSteps || [],
        testimonials: content.testimonials || [],
        heroSlides: content.heroSlides || [],
        approachText: content.approachText || '',
        approachQuote: content.approachQuote || '',
        whatYouGet: content.whatYouGet || [],
      });
    }
  }, [content, form]);

  const onSubmit = (data: HomepageForm) => {
    updateMutation.mutate({ data }, {
      onSuccess: () => {
        toast({ title: 'Homepage content updated' });
        queryClient.invalidateQueries({ queryKey: getGetHomepageContentQueryKey() });
      },
      onError: () => {
        toast({ title: 'Failed to update content', variant: 'destructive' });
      }
    });
  };

  if (isLoading) {
    return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900">Homepage Content</h1>
        <p className="text-gray-500 mt-1">Manage text and images shown on the landing page</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20 max-w-4xl">
          
          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>Hero Slides (the rotating banners at the top of the homepage)</CardTitle>
            </CardHeader>
            <CardContent>
              <HeroSlidesEditor form={form} />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>Fallback Hero Text (only shown if there are no slides above)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="heroBadge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge Text (small label above the headline)</FormLabel>
                    <FormControl>
                      <Input placeholder="Foundation of Trust" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heroHeading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Headline</FormLabel>
                    <FormControl>
                      <Input placeholder="Secure Your Future..." className="text-lg font-bold" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heroSubheading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subheading</FormLabel>
                    <FormControl>
                      <Textarea placeholder="We make land ownership..." className="resize-none" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heroImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} value={field.value || ''} />
                    </FormControl>
                    {field.value && (
                      <div className="mt-4 h-48 rounded-lg overflow-hidden border border-gray-200">
                        <img src={field.value} alt="Hero Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>Company Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="mission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mission Statement</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vision Statement</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="communityImpact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Impact (CSR)</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>Performance Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="statsYearsInBusiness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years Active</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="statsPropertiesSold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plots Sold</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="statsHappyClients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Happy Clients</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="statsCountiesCovered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Counties</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value || ''} onChange={field.onChange} />
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
              <CardTitle>Our Approach Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="approachText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Introduction Text</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" placeholder="Finding the right piece of land is personal..." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="approachQuote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pull Quote (shown in italics with a gold bar)</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" placeholder="We don't just sell plots..." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>What You Get (checklist)</CardTitle>
            </CardHeader>
            <CardContent>
              <WhatYouGetEditor form={form} />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>How to Own Your Plot (Process Steps)</CardTitle>
            </CardHeader>
            <CardContent>
              <CardListEditor control={form.control} name="processSteps" itemLabel="Step" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>The EWAMA Advantage (Why Choose Us)</CardTitle>
            </CardHeader>
            <CardContent>
              <CardListEditor control={form.control} name="advantages" itemLabel="Advantage" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>Client Testimonials</CardTitle>
            </CardHeader>
            <CardContent>
              <TestimonialListEditor control={form.control} />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>Bottom Call-to-Action Banner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="ctaHeading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heading</FormLabel>
                    <FormControl>
                      <Input placeholder="Ready to Secure Your Piece of Kenya?" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ctaSubheading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supporting Text</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" placeholder="Join hundreds of smart investors..." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white px-8 h-12"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              Save Content
            </Button>
          </div>
        </form>
      </Form>
    </AdminLayout>
  );
}
