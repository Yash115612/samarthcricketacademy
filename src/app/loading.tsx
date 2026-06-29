export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-accent-red border-t-transparent rounded-full animate-spin" />
        <div className="text-accent-gold text-lg font-bold">Loading Samarth Cricket Academy...</div>
      </div>
    </div>
  );
}
