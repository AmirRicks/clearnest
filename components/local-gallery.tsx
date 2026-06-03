import type { BeforeAfterPair } from "@/lib/before-after";
import { BeforeAfterPairCard } from "@/components/before-after-card";
import { BEFORE_AFTER_PAIRS } from "@/lib/before-after";

interface LocalGalleryProps {
  citySlug: string;
  cityName: string;
}

export function LocalGallery({ citySlug, cityName }: LocalGalleryProps) {
  const localPhotos = BEFORE_AFTER_PAIRS.filter((p): p is BeforeAfterPair => p.city === citySlug);

  if (localPhotos.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h3 className="text-center font-semibold tracking-tight text-charcoal display-3">
        Recent Work in {cityName}
      </h3>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {localPhotos.map((pair) => (
          <BeforeAfterPairCard key={pair.id} pair={pair} />
        ))}
      </div>
    </div>
  );
}
