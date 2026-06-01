import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { FloatingCta } from "@/components/lead/floating-cta";
import { ExitIntent } from "@/components/lead/exit-intent";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main className="pt-16 md:pt-20">{children}</main>
      <Footer />
      <FloatingCta />
      <ExitIntent />
    </>
  );
}
