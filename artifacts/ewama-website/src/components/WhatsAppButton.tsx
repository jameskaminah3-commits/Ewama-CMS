import { useGetSettings } from '@workspace/api-client-react';

function toWaLink(raw: string): string {
  if (raw.startsWith('http')) return raw;
  let digits = raw.replace(/[^0-9]/g, '');
  // Normalise Kenyan numbers: 07xx… → 2547xx…
  if (digits.startsWith('0')) digits = `254${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

/** Floating WhatsApp chat button shown on every public page. */
export function WhatsAppButton() {
  const { data: settings } = useGetSettings();
  const target = settings?.whatsapp || settings?.phone || '+254720769999';

  return (
    <a
      href={toWaLink(target)}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105"
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white" aria-hidden="true">
        <path d="M16.004 3C9.383 3 4 8.383 4 15.004c0 2.117.553 4.185 1.604 6.008L4 29l8.184-1.572a11.94 11.94 0 0 0 3.82.625h.001C22.625 28.053 28 22.67 28 16.049 28 12.842 26.752 9.827 24.484 7.56 22.217 5.292 19.21 3 16.004 3zm0 21.984h-.001a9.95 9.95 0 0 1-3.527-.645l-.253-.096-4.857.933.99-4.727-.165-.263a9.935 9.935 0 0 1-1.53-5.182c0-5.514 4.486-10 10-10 2.67 0 5.18 1.04 7.068 2.929a9.926 9.926 0 0 1 2.928 7.07c0 5.514-4.485 9.981-9.653 9.981zm5.472-7.463c-.3-.15-1.77-.874-2.045-.974-.274-.1-.474-.15-.673.15-.2.3-.774.973-.949 1.173-.174.2-.35.225-.649.075-.3-.15-1.263-.465-2.406-1.485-.889-.793-1.489-1.772-1.663-2.072-.175-.3-.019-.462.13-.611.135-.134.3-.35.45-.524.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.673-1.622-.923-2.221-.243-.583-.49-.504-.673-.513l-.573-.01c-.2 0-.524.075-.798.375-.275.3-1.048 1.024-1.048 2.496 0 1.473 1.073 2.896 1.222 3.096.15.2 2.11 3.222 5.113 4.518.714.308 1.272.492 1.706.63.717.228 1.37.196 1.886.119.575-.086 1.77-.724 2.02-1.423.249-.699.249-1.298.174-1.423-.074-.125-.274-.2-.573-.35z"/>
      </svg>
    </a>
  );
}
