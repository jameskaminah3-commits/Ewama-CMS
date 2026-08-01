import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  /** Endless-scrolling short phrases shown beneath the title. */
  marquee?: string[];
  /** Scroll the marquee left-to-right instead of right-to-left. */
  marqueeReverse?: boolean;
  /** Seconds for one full marquee loop (lower = faster). */
  marqueeDuration?: number;
  /** Render marquee items in an uppercase, letter-spaced editorial style. */
  marqueeUppercase?: boolean;
  /** Faint land photo behind the dark banner (like the homepage stats band). */
  backgroundImage?: string;
  children?: ReactNode;
}

function Marquee({ items, reverse = false, duration = 30, uppercase = false }: { items: string[]; reverse?: boolean; duration?: number; uppercase?: boolean }) {
  const track = [...items, ...items]; // duplicated so the loop is seamless
  return (
    <div
      className="relative mt-4 overflow-hidden"
      style={{ maskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)' }}
    >
      <motion.div
        className="flex w-max items-center whitespace-nowrap"
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration, ease: 'linear', repeat: Infinity }}
      >
        {track.map((phrase, i) => (
          <span
            key={i}
            className={
              uppercase
                ? 'flex items-center font-heading text-base font-semibold uppercase tracking-[0.18em] text-white/90 md:text-lg'
                : 'flex items-center text-lg font-light tracking-wide text-white/85 md:text-xl'
            }
          >
            {phrase}
            <span className="mx-7 inline-block h-1.5 w-1.5 rotate-45 bg-secondary" aria-hidden="true" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/**
 * Standard banner for inner pages: dark brand background (optionally with a
 * faint land photo showing through), a gold kicker, a serif title, and either
 * a static subtitle or an endless-scrolling marquee of short phrases.
 */
export function PageHeader({ kicker, title, subtitle, marquee, marqueeReverse, marqueeDuration, marqueeUppercase, backgroundImage, children }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-primary py-9 md:py-11">
      {backgroundImage && (
        <>
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-[0.3]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/40 to-primary/80" />
        </>
      )}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-secondary" aria-hidden="true" />
      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 text-left sm:px-6 lg:px-10">
        {kicker && (
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-secondary">{kicker}</p>
        )}
        {marquee && marquee.length > 0 ? (
          <>
            <h1 className="max-w-3xl font-heading text-3xl font-bold text-white md:text-4xl">{title}</h1>
            <Marquee items={marquee} reverse={marqueeReverse} duration={marqueeDuration} uppercase={marqueeUppercase} />
          </>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[0.42fr_0.58fr] lg:items-end">
            <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">{title}</h1>
            {subtitle && (
              <p className="max-w-4xl text-lg font-light text-white/80 lg:justify-self-end lg:text-right">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
