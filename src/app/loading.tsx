export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
      <span className="ml-4 text-white text-lg">Chargement...</span>
    </div>
  )
}
