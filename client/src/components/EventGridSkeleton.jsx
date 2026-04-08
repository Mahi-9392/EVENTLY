export default function EventGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-3xl border border-white/60 bg-white/60 shadow-lg"
        >
          <div
            className="aspect-[16/10] animate-shimmer bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]"
          />
          <div className="space-y-3 p-5">
            <div className="h-6 w-3/4 rounded-lg bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-2/3 rounded bg-slate-100" />
            <div className="flex justify-between pt-2">
              <div className="h-8 w-20 rounded-lg bg-slate-200" />
              <div className="h-6 w-16 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
