import { useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  images: string[];
  alt: string;
  openIndex: number | null;
  onOpenChange: (index: number | null) => void;
}

/**
 * Full-screen image viewer with prev/next navigation and arrow-key support.
 * Controlled: pass the index to show, or null when closed.
 */
export function ImageLightbox({ images, alt, openIndex, onOpenChange }: ImageLightboxProps) {
  const isOpen = openIndex !== null && images.length > 0;
  const index = openIndex ?? 0;

  const step = useCallback((delta: number) => {
    if (images.length < 2) return;
    onOpenChange(((index + delta) % images.length + images.length) % images.length);
  }, [images.length, index, onOpenChange]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, step]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onOpenChange(null)}>
      <DialogContent className="max-w-6xl w-[95vw] p-0 bg-black/95 border-none overflow-hidden">
        <DialogTitle className="sr-only">{alt} — image {index + 1} of {images.length}</DialogTitle>
        <div className="relative flex items-center justify-center min-h-[60vh] max-h-[85vh]">
          <img
            src={images[index]}
            alt={`${alt} — image ${index + 1}`}
            className="max-w-full max-h-[85vh] object-contain"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => step(-1)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => step(1)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onOpenChange(i)}
                    aria-label={`Go to image ${i + 1}`}
                    className={cn(
                      'w-2 h-2 rounded-full transition-colors',
                      i === index ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
