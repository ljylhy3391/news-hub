export default function Loading() {
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">태그 로딩 중…</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="aspect-video w-full bg-slate-200/10 mb-3" />
            <div className="h-4 bg-slate-200/20 mb-2" />
            <div className="h-4 bg-slate-200/20 w-2/3" />
          </div>
        ))}
      </div>
    </main>
  );
}
