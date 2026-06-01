import { HouseTour } from "@/components/house-tour";
import { TrustMarquee } from "@/components/trust-marquee";
import { StatsBand } from "@/components/stats-band";
import { HowItWorks } from "@/components/how-it-works";
import { ServicesTeaser } from "@/components/services-teaser";
import { PriceEstimator } from "@/components/price-estimator";
import { GalleryStrip } from "@/components/gallery-strip";
import { ReviewsStrip } from "@/components/reviews-strip";
import { CtaBand } from "@/components/cta-band";

export default function HomePage() {
  return (
    <>
      <HouseTour />
      <TrustMarquee />
      <HowItWorks />
      <StatsBand />
      <ServicesTeaser />
      <PriceEstimator />
      <GalleryStrip />
      <ReviewsStrip />
      <CtaBand />
    </>
  );
}
