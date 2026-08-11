/**
 * Loading skeleton for app/[...navpath]
 *
 * Renders immediately while the server fetches the node from DB.
 * Prevents blank white flash on navigation.
 */
export default function NavPathLoading() {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 py-3 mb-6">
          {[80, 60, 80, 60].map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-stone-300">/</span>}
              <div
                className="h-3 rounded-full bg-stone-200 animate-pulse"
                style={{ width: w }}
              />
            </div>
          ))}
        </div>

        {/* Hero skeleton */}
        <div className="rounded-2xl bg-stone-200 animate-pulse h-32 mb-8" />

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Filter sidebar skeleton */}
          <div className="w-full lg:w-1/4 space-y-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-5">
              {[140, 200, 160, 180].map((h, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-stone-100 animate-pulse"
                  style={{ height: h }}
                />
              ))}
            </div>
          </div>

          {/* Product grid skeleton */}
          <div className="w-full lg:w-3/4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl bg-stone-100 aspect-[3/4]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
