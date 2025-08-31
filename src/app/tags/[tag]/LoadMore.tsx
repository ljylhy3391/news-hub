"use client";

import { useState } from "react";
import { NewsGrid } from "@/components/NewsGrid";
import type { Entry } from "@/types/news";

export default function LoadMore({
  items,
  initialCount = 12,
  step = 12,
}: {
  items: Entry[];
  initialCount?: number;
  step?: number;
}) {
  const [count, setCount] = useState(initialCount);
  const visible = items.slice(0, count);
  const hasMore = count < items.length;

  return (
    <div className="space-y-4">
      <NewsGrid items={visible} />
      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setCount((c) => Math.min(c + step, items.length))}
            className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
          >
            더 보기
          </button>
        </div>
      )}
    </div>
  );
}
