import { useMemo } from 'react';
import { MapPin } from 'lucide-react';

const DEFAULT_EMBED =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609849077!2d72.74109995!3d19.08219765!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin';

/** Uses VITE_GOOGLE_MAPS_EMBED_URL when set; otherwise a static Mumbai embed (demo). */
export default function CoverageMapPreview({ city, className = '' }: { city: string; className?: string }) {
  const src = useMemo(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_EMBED_URL as string | undefined;
    if (key && key.startsWith('http')) return key;
    return DEFAULT_EMBED;
  }, []);

  return (
    <div className={`rounded-xl border border-border overflow-hidden bg-muted/30 ${className}`}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/80">
        <MapPin className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-foreground">Demand & risk zones — {city}</span>
        <span className="text-[10px] text-muted-foreground ml-auto">Google Maps</span>
      </div>
      <iframe
        title={`Map ${city}`}
        src={src}
        className="w-full h-[200px] lg:h-[240px] border-0 grayscale-[0.2] dark:opacity-90"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
