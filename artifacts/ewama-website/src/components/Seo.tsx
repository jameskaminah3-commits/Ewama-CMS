import { useEffect } from 'react';

const SITE_NAME = 'EWAMA Properties Ltd';
const DEFAULT_DESCRIPTION =
  'EWAMA Properties Ltd — Foundation of Trust. Investment-grade land in Kenya with ready title deeds, transparent pricing, and flexible payment plans.';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string | null;
  /** Set og:type, e.g. "article" for blog posts. Defaults to "website". */
  type?: string;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/**
 * Per-page SEO tags for an SPA: document title, meta description, and
 * Open Graph / Twitter cards. Render once per public page.
 */
export function Seo({ title, description, image, type = 'website' }: SeoProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Foundation of Trust`;
    const desc = description || DEFAULT_DESCRIPTION;

    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:url', window.location.href);
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    if (image) {
      setMeta('property', 'og:image', image);
      setMeta('name', 'twitter:image', image);
    }
  }, [title, description, image, type]);

  return null;
}
