import { CinematicHero } from "@/components/cinematic-hero";
import { HowItWorks } from "@/components/how-it-works";
import { ServicesTeaser } from "@/components/services-teaser";
import { PriceEstimator } from "@/components/price-estimator";
import { GalleryStrip } from "@/components/gallery-strip";
import { ReviewsStrip } from "@/components/reviews-strip";
import { CtaBand } from "@/components/cta-band";

export default function HomePage() {
  return (
    <>
      <CinematicHero />
      <HowItWorks />
      <ServicesTeaser />
      <PriceEstimator />
      <GalleryStrip />
      <ReviewsStrip />
      <CtaBand />
    </>
  );
}
