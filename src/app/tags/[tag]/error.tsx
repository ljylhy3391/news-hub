"use client";

export default function Error({
  error: _error, // 사용하지 않으므로 언더스코어로 경고 방지
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">문제가 발생했습니다</h1>
      <p className="text-slate-600">잠시 후 다시 시도해 주세요.</p>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
      >
        다시 시도
      </button>
    </main>
  );
}
