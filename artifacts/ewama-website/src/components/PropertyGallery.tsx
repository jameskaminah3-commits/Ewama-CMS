import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Expand } from 'lucide-react';
import { ImageLightbox } from '@/components/ImageLightbox';

function youTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1]! : null;
}

function toEmbed(url: string): { type: 'iframe' | 'file'; src: string } {
  const u = url.trim();
  const yt = youTubeId(u);
  if (yt) return { type: 'iframe', src: `https://www.youtube.com/embed/${yt}?rel=0&modestbranding=1&autoplay=1` };
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1` };
  return { type: 'file', src: u };
}

type Item =
  | { type: 'image'; src: string }
  | { type: 'video'; url: string; poster: string };

/**
 * Unified media gallery: one large stage that shows the selected photo or
 * plays the selected video, with prev/next arrows and a scrollable thumbnail
 * rail combining photos and video posters. Photos open full-screen on click.
 */
export function PropertyGallery({
  images,
  videos,
  alt,
  statusLabel,
}: {
  images: string[];
  videos: string[];
  alt: string;
  statusLabel?: string;
}) {
  const items: Item[] = [
    ...images.map((src) => ({ type: 'image' as const, src })),
    ...videos.map((url) => {
      const id = youTubeId(url);
      return { type: 'video' as const, url, poster: id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : images[0] || '' };
    }),
  ];

  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (items.length === 0) return null;
  const current = items[Math.min(active, items.length - 1)]!;

  const go = (dir: number) => {
    setPlaying(false);
    setActive((a) => (a + dir + items.length) % items.length);
  };
  const select = (i: number) => {
    setPlaying(false);
    setActive(i);
  };

  // Arrow-key navigation on desktop (ignored while typing or when a video is
  // playing so it doesn't fight the player's own controls).
  useEffect(() => {
    if (items.length <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (playing || lightboxIndex !== null) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [items.length, playing, lightboxIndex]);

  // Swipe left/right on touch devices.
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0]?.clientX ?? null; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  return (
    <div className="mb-8">
      {/* Stage */}
      <div
        className="group/stage relative h-[360px] md:h-[560px] rounded-2xl overflow-hidden bg-black"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {current.type === 'image' ? (
          <img
            key={active}
            src={current.src}
            alt={alt}
            className="h-full w-full object-cover cursor-zoom-in animate-in fade-in duration-500"
            onClick={() => setLightboxIndex(active)}
          />
        ) : playing ? (
          (() => {
            const embed = toEmbed(current.url);
            return embed.type === 'iframe' ? (
              <iframe
                src={embed.src}
                title={alt}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={embed.src} controls autoPlay className="h-full w-full object-contain bg-black">
                Your browser does not support embedded videos.
              </video>
            );
          })()
        ) : (
          <button type="button" className="relative h-full w-full" onClick={() => setPlaying(true)} aria-label="Play video">
            <img src={current.poster} alt={alt} className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-primary shadow-xl transition-transform group-hover/stage:scale-105">
                <Play className="ml-1 h-9 w-9 fill-current" />
              </span>
            </span>
          </button>
        )}

        {statusLabel && (
          <div className="absolute top-4 left-4 z-10 bg-secondary text-white text-sm font-bold px-4 py-2 rounded-md shadow-md uppercase tracking-wide">
            {statusLabel}
          </div>
        )}

        {current.type === 'image' && (
          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-black/50 text-white text-sm px-3 py-2 rounded-md backdrop-blur-sm opacity-0 group-hover/stage:opacity-100 transition-opacity pointer-events-none">
            <Expand className="w-4 h-4" /> Click to enlarge
          </div>
        )}

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-primary shadow-md hover:bg-white transition"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-primary shadow-md hover:bg-white transition"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {active + 1} / {items.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail rail */}
      {items.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 snap-x">
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => select(i)}
              aria-label={item.type === 'video' ? `Play video ${i + 1}` : `View photo ${i + 1}`}
              className={`relative w-28 h-20 shrink-0 snap-start rounded-lg overflow-hidden bg-gray-100 transition ring-offset-2 ${i === active ? 'ring-2 ring-secondary' : 'ring-1 ring-gray-200 hover:ring-secondary/60'}`}
            >
              <img
                src={item.type === 'image' ? item.src : item.poster}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
              {item.type === 'video' && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="h-6 w-6 text-white fill-current" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <ImageLightbox images={images} alt={alt} openIndex={lightboxIndex} onOpenChange={setLightboxIndex} />
    </div>
  );
}
