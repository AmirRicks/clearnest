export default function PostersPage() {
  const posters = [
    { file: "poster-brand.svg", label: "Brand Awareness" },
    { file: "poster-book-in-60.svg", label: "Book in 60 Seconds" },
    { file: "poster-pay-after.svg", label: "Pay After the Clean" },
    { file: "poster-standard-cleaning.svg", label: "Standard Cleaning" },
    { file: "poster-deep-cleaning.svg", label: "Deep Cleaning" },
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container-tight">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-charcoal">ClearNest Advertising Posters</h1>
          <p className="mt-2 text-graphite">Right-click any poster to save as SVG. Open in Preview or Photoshop to export as PNG/PDF.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posters.map((p) => (
            <a
              key={p.file}
              href={`/posters/${p.file}`}
              download
              className="group block overflow-hidden rounded-2xl border border-stone/70 bg-white shadow-card transition hover:shadow-glow"
            >
              <img
                src={`/posters/${p.file}`}
                alt={p.label}
                className="w-full"
              />
              <div className="border-t border-stone/70 px-4 py-3">
                <p className="text-sm font-semibold text-charcoal group-hover:text-brand-600 transition">{p.label}</p>
                <p className="text-xs text-graphite mt-0.5">Click to download SVG</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
