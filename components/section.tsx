import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("relative py-20 sm:py-28", className)}>
      <div className="container-tight">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-stone/70 bg-paper/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-graphite">
      <span className="h-1 w-1 rounded-full bg-brand-500" />
      {children}
    </span>
  );
}

export function H2({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        "mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-charcoal sm:text-4xl md:text-5xl",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function Lead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("mt-5 max-w-2xl text-pretty text-base leading-relaxed text-graphite md:text-lg", className)}>
      {children}
    </p>
  );
}
