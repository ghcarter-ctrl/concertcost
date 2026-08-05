export default function AppLoading() {
  return (
    <div className="section-stack animate-fade-in">
      <div className="space-y-2">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-4 w-72 max-w-full" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-box border border-base-300/60 bg-base-100 p-4">
            <div className="skeleton mb-3 h-3 w-24" />
            <div className="skeleton h-8 w-20" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-box border border-base-300/60 bg-base-100 p-4">
            <div className="skeleton mb-4 h-4 w-40" />
            <div className="skeleton h-64 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
