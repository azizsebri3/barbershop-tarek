export default function PricingLoading() {
  return (
    <main className="space-y-8 px-5 py-20 md:px-8 md:py-32">
      <div className="mx-auto h-16 max-w-2xl animate-pulse rounded-xl bg-white/5" />
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    </main>
  )
}
