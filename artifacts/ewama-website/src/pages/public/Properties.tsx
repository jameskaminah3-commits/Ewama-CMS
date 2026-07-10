import { useState, useMemo } from 'react';
import { useListProperties } from '@workspace/api-client-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { MapPin, Search, ChevronRight, SlidersHorizontal } from 'lucide-react';

export default function Properties() {
  const [searchTerm, setSearchTerm] = useState('');
  const [countyFilter, setCountyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: propertiesData, isLoading } = useListProperties({
    search: searchTerm || undefined,
    county: countyFilter !== 'all' ? countyFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
  });

  const properties = propertiesData?.data || [];
  
  // Extract unique counties for the filter dropdown
  const counties = useMemo(() => {
    if (!propertiesData?.data) return [];
    const uniqueCounties = new Set(propertiesData.data.map(p => p.county));
    return Array.from(uniqueCounties).sort();
  }, [propertiesData?.data]);

  return (
    <PublicLayout>
      <div className="bg-primary pt-16 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] opacity-5 mix-blend-overlay bg-cover bg-center" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            Available Properties
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto font-light">
            Discover investment-grade land in high-growth corridors. Each property is thoroughly vetted, with ready title deeds.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-12 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Search by location, landmark or feature..." 
              className="pl-10 h-12 bg-gray-50 border-transparent focus-visible:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={countyFilter} onValueChange={setCountyFilter}>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        </div>
      </div>
    </PublicLayout>
  );
}
