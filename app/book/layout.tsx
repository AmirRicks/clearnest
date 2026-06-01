import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="pt-16 md:pt-20">{children}</main>
      <Footer />
    </>
  );
}
