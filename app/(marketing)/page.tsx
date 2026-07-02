import { ReviewSchemaJsonLd } from "@/components/review-schema";
import { PremiumHero } from "@/components/premium-hero";
import { TrustMarquee } from "@/components/trust-marquee";
import { StatsBand } from "@/components/stats-band";
import { HowItWorks } from "@/components/how-it-works";
import { ServicesTeaser } from "@/components/services-teaser";
import { PriceEstimator } from "@/components/price-estimator";
import { GalleryStrip } from "@/components/gallery-strip";
import { ReviewsStrip } from "@/components/reviews-strip";
import { ServiceAreas } from "@/components/service-areas";
import { CtaBand } from "@/components/cta-band";

export default function HomePage() {
  return (
    <>
      <ReviewSchemaJsonLd />
      <PremiumHero />
      <TrustMarquee />
      <HowItWorks />
      <StatsBand />
      <ServicesTeaser />
      <PriceEstimator />
      <GalleryStrip />
      <ReviewsStrip />
      <ServiceAreas />
      <CtaBand />
    </>
  );
}
