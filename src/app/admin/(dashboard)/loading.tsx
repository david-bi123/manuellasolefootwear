export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-5 motion-reduce:animate-none" aria-busy="true" aria-label="Loading console">
      {/* Hero band skeleton */}
      <div className="h-[150px] rounded-2xl bg-sand/70" />
      {/* Toolbar row */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-40 rounded-full bg-sand" />
        <div className="h-9 w-64 rounded-lg bg-cream" />
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="admin-card h-[132px] p-5">
            <div className="h-3 w-24 rounded-full bg-cream" />
            <div className="mt-4 h-8 w-32 rounded bg-sand/80" />
            <div className="mt-3 h-2.5 w-28 rounded-full bg-cream" />
          </div>
        ))}
      </div>
      {/* Chart panels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="admin-card h-[360px] lg:col-span-2" />
        <div className="admin-card h-[360px]" />
      </div>
    </div>
  );
}
