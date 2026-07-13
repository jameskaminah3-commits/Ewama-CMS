import { useState } from 'react';
import { useListMedia, getListMediaQueryKey } from '@workspace/api-client-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Image as ImageIcon, Search, Upload } from 'lucide-react';
import { Link } from 'wouter';

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  title?: string;
}

/**
 * Grid picker over the Media Library. Clicking an image calls onSelect with
 * its public URL and closes the dialog.
 */
export function MediaPickerDialog({ open, onOpenChange, onSelect, title = 'Choose an image' }: MediaPickerDialogProps) {
  const [search, setSearch] = useState('');
  const params = { limit: 100, search: search || undefined };
  const { data, isLoading } = useListMedia(params, {
    query: { enabled: open, queryKey: getListMediaQueryKey(params) },
  });

  const images = (data?.data || []).filter(f => f.mimeType?.startsWith('image/'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by file name..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-y-auto flex-1 mt-2">
          {isLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="aspect-square rounded-lg" />)}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-16">
              <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium mb-1">No images in your Media Library{search ? ' match this search' : ''}.</p>
              <p className="text-sm text-gray-400 mb-4">Upload photos first, then pick them here.</p>
              <Link href="/admin/media">
                <Button variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" /> Open Media Library
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => { onSelect(file.url); onOpenChange(false); }}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary hover:border-primary transition-colors"
                >
                  <img
                    src={file.thumbnailUrl || file.url}
                    alt={file.altText || file.fileName}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {file.fileName}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
