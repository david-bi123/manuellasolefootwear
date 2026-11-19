export default function StoreLoading() {
  return (
    <div className="animate-pulse motion-reduce:animate-none" aria-busy="true" aria-label="Loading page">
      {/* Hero skeleton */}
      <div className="border-b border-line bg-editorial">
        <div className="shell grid items-center gap-8 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
          <div className="space-y-5">
            <div className="h-3 w-40 rounded-full bg-sand" />
            <div className="h-16 w-4/5 rounded-lg bg-sand" />
            <div className="h-16 w-3/5 rounded-lg bg-sand" />
            <div className="h-4 w-2/3 rounded-full bg-cream" />
            <div className="h-4 w-1/2 rounded-full bg-cream" />
            <div className="flex gap-3 pt-3">
              <div className="h-14 w-48 rounded-md bg-sand" />
              <div className="h-14 w-44 rounded-md bg-cream" />
            </div>
          </div>
          <div className="mx-auto aspect-[4/5] w-full max-w-[440px] rounded-2xl bg-sand/80" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="shell py-16">
        <div className="h-3 w-28 rounded-full bg-sand" />
        <div className="mt-3 h-10 w-64 rounded-lg bg-sand" />
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <div className="aspect-[3/4] rounded-xl bg-cream" />
              <div className="mt-4 h-3 w-1/2 rounded-full bg-cream" />
              <div className="mt-2 h-5 w-4/5 rounded bg-sand/70" />
              <div className="mt-2 h-4 w-1/3 rounded-full bg-cream" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
