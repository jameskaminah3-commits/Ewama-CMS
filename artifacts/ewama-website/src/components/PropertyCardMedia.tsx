import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Play } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

function youTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1]! : null;
}

type MediaSlide = { kind: 'image'; src: string } | { kind: 'video'; poster: string };

interface CardProperty {
  id: number;
  name: string;
  heroImage?: string | null;
  gallery?: string[] | null;
  videos?: string[] | null;
}

/**
 * Card media that gently crossfades through a property's photos and, when the
 * project has videos, includes a poster slide with a play overlay (a light
 * preview — the video itself plays on the property page). Each card starts on
 * a different slide so a grid doesn't pulse in unison. `children` overlays any
 * badges the page wants (status, "For Sale", etc.).
 */
export function PropertyCardMedia({
  property,
  heightClass = 'h-64',
  intervalMs = 3500,
  children,
}: {
  property: CardProperty;
  heightClass?: string;
  intervalMs?: number;
  children?: ReactNode;
}) {
  const slides = useMemo<MediaSlide[]>(() => {
    const hero = property.heroImage?.trim() || FALLBACK_IMAGE;
    const rest = (property.gallery || []).filter((g) => g && g !== hero);
    const images: MediaSlide[] = [hero, ...rest].map((src) => ({ kind: 'image', src }));
    const videoSlides: MediaSlide[] = (property.videos || []).map((url) => {
      const id = youTubeId(url);
      return { kind: 'video', poster: id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : hero };
    });
    return [...images, ...videoSlides];
  }, [property.heroImage, property.gallery, property.videos]);

  const [idx, setIdx] = useState(property.id % Math.max(slides.length, 1));

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(t);
  }, [slides.length, intervalMs]);

  return (
    <div className={`relative ${heightClass} overflow-hidden bg-gray-100`}>
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={slide.kind === 'image' ? slide.src : slide.poster}
              alt={property.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            {slide.kind === 'video' && (
              <>
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg">
                    <Play className="ml-0.5 h-6 w-6 fill-current" />
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {children}

      {slides.length > 1 && (
        <div className="absolute bottom-3 left-3 z-20 flex gap-1.5">
          {slides.map((s, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/60'} ${s.kind === 'video' ? 'ring-1 ring-secondary' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
