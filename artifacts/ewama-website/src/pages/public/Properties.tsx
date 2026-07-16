import { useState, useMemo, useEffect } from 'react';
import { useSearch } from 'wouter';
import { useListProperties } from '@workspace/api-client-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PageHeader } from '@/components/PageHeader';
import { Seo } from '@/components/Seo';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { MapPin, Search, ChevronRight, ChevronLeft, SlidersHorizontal } from 'lucide-react';

const PAGE_SIZE = 12;

export default function Properties() {
  const [searchTerm, setSearchTerm] = useState('');
  const [countyFilter, setCountyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Allow deep links like /properties?county=Kajiado (used by the
  // homepage Featured Locations cards).
  const searchString = useSearch();
  useEffect(() => {
    const county = new URLSearchParams(searchString).get('county');
    if (county) {
      setCountyFilter(county);
      setPage(1);
    }
  }, [searchString]);

  const { data: propertiesData, isLoading } = useListProperties({
    search: searchTerm || undefined,
    county: countyFilter !== 'all' ? countyFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
    page,
    limit: PAGE_SIZE,
  });

  const properties = propertiesData?.data || [];
  const totalPages = Math.max(1, Math.ceil((propertiesData?.total || 0) / PAGE_SIZE));

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Derive the county dropdown from an unfiltered listing so options don't
  // collapse when a search/county/status filter narrows the current page.
  const { data: allForCounties } = useListProperties({ limit: 50 });
  const counties = useMemo(() => {
    if (!allForCounties?.data) return [];
    const uniqueCounties = new Set(allForCounties.data.map(p => p.county).filter(Boolean));
    return Array.from(uniqueCounties).sort();
  }, [allForCounties?.data]);

  return (
    <PublicLayout>
      <Seo
        title="Available Properties"
        description="Browse investment-grade land for sale across Kenya — vetted plots with ready title deeds, flexible cash and installment payment plans."
      />
      <PageHeader
        kicker="Our Portfolio"
        title="Our Properties"
        subtitle="Prime value-added plots with title deeds guaranteed — thoroughly vetted land in Kenya's high-growth corridors."
      />

      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-6 lg:px-10 -mt-8 relative z-20">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-12 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Search by location, landmark or feature..." 
              className="pl-10 h-12 bg-gray-50 border-transparent focus-visible:bg-white"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={countyFilter} onValueChange={(v) => { setCountyFilter(v); setPage(1); }}>
              <SelectTrigger className="h-12 bg-gray-50 border-transparent">
                <SelectValue placeholder="All Counties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counties</SelectItem>
                {counties.map(county => (
                  <SelectItem key={county} value={county}>{county}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="h-12 bg-gray-50 border-transparent">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="coming_soon">Coming Soon</SelectItem>
                <SelectItem value="sold_out">Sold Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-900">
              {isLoading ? "Loading properties..." : `${propertiesData?.total || 0} Properties Found`}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
            {isLoading ? (
              [1,2,3,4,5,6].map(i => (
                <div key={i} className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                  <Skeleton className="w-full h-64" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-1/3" />
                  </div>
                </div>
              ))
            ) : properties.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-xl">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-500">Try adjusting your filters or search term.</p>
              </div>
            ) : (
              properties.map((property) => (
                <Link key={property.id} href={`/properties/${property.slug}`}>
                  <div className="group rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer">
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                      <img 
                        src={property.heroImage || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                        alt={property.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <div className="bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm uppercase tracking-wide">
                          {property.status === 'available' ? 'Available' : property.status.replace('_', ' ')}
                        </div>
                        {property.featured && (
                          <div className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm uppercase tracking-wide">
                            Featured
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-secondary mb-3">
                        <MapPin className="w-4 h-4" />
                        {property.location}, {property.county}
                      </div>
                      <h3 className="text-xl font-heading font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {property.name}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        {property.plotSize && (
                          <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                            <SlidersHorizontal className="w-3 h-3" /> Size: {property.plotSize}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1">
                        {property.shortDescription}
                      </p>
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Cash Price from</p>
                          <p className="text-lg font-bold text-primary">
                            Ksh. {property.cashPrice.toLocaleString()}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | 'gap')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('gap');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === 'gap' ? (
                    <span key={`gap-${idx}`} className="px-1 text-gray-400">…</span>
                  ) : (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      className={p === page ? 'h-10 w-10 bg-primary text-white' : 'h-10 w-10'}
                      size="icon"
                      onClick={() => goToPage(p)}
                    >
                      {p}
                    </Button>
                  )
                )}
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
