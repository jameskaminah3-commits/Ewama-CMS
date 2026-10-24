import { Compass } from 'lucide-react';

/** Set to TBM's website or social page to make the credit a link. */
const TBM_URL: string | null = null;

/**
 * "Crafted by TBM" builder credit — a nod to Tembea Bila Matata, a travel
 * company. On desktop the compass turns and the full name unfolds on hover;
 * on phones (no hover) the full name is always shown.
 */
export function TbmCredit({ className = '' }: { className?: string }) {
  const content = (
    <>
      <Compass
        className="w-3.5 h-3.5 text-secondary transition-transform duration-700 ease-out group-hover:rotate-[360deg]"
        aria-hidden="true"
      />
      <span>
        Crafted by <span className="font-semibold tracking-wider text-white/80 group-hover:text-white transition-colors">TBM</span>
      </span>
      <span
        className="inline-block overflow-hidden whitespace-nowrap align-bottom transition-all duration-500 ease-out max-w-0 opacity-0 group-hover:max-w-[11rem] group-hover:opacity-100 max-md:max-w-none max-md:opacity-100"
      >
        <span className="text-white/30 mr-1.5">·</span>
        <span className="italic text-secondary/90">Tembea Bila Matata</span>
      </span>
    </>
  );

  const classes = `group inline-flex items-center gap-1.5 text-white/50 ${className}`;
  const title = 'Website crafted by TBM — Tembea Bila Matata (travel without worries)';

  return TBM_URL ? (
    <a href={TBM_URL} target="_blank" rel="noreferrer" title={title} className={`${classes} hover:text-white transition-colors`}>
      {content}
    </a>
  ) : (
    <span title={title} className={classes}>
      {content}
    </span>
  );
}
