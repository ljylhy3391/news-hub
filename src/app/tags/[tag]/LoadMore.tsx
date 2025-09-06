"use client";

import { useState, useTransition } from "react";
import { NewsGrid } from "@/components/NewsGrid";
import type { Entry } from "@/types/news";
import { fetchMoreEntries } from "./actions";

type Props = {
  items: Entry[]; // 초기 프리페치된 목록(페이지 서버 컴포넌트에서 전달)
  tag: string;
  sort?: "latest" | "popular" | string;
  initialCount?: number;
  step?: number;
};

export default function LoadMore({
  items: initialItems,
  tag,
  sort = "latest",
  initialCount = 13,
  step = 12,
}: Props) {
  const initialVisible = initialItems.slice(0, initialCount);

  const [items, setItems] = useState<Entry[]>(initialVisible);
  const [offset, setOffset] = useState<number>(initialVisible.length);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [pending, startTransition] = useTransition();

  const onMore = () => {
    startTransition(async () => {
      // 1) 아직 초기 프리페치 목록에 남은 게 있으면 거기서 먼저 소진
      if (offset < initialItems.length) {
        const next = initialItems.slice(
          offset,
          Math.min(offset + step, initialItems.length)
        );
        if (next.length > 0) {
          setItems((prev) => [...prev, ...next]);
          setOffset(offset + next.length);
          return;
        }
      }

      // 2) 초기 프리페치 소진 후 서버 액션으로 추가 보강 가져오기
      const res = await fetchMoreEntries({
        tag,
        offset,
        count: step,
        sort,
      });

      if (res.items.length > 0) {
        setItems((prev) => {
          const seen = new Set(prev.map((i) => i.id));
          const dedup = res.items.filter((i) => !seen.has(i.id));
          return [...prev, ...dedup];
        });
        setOffset(res.nextOffset);
        setHasMore(res.hasMore);
      } else {
        setHasMore(false);
      }
    });
  };

  return (
    <div className="space-y-4">
      <NewsGrid items={items} />
      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onMore}
            disabled={pending}
            className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-neutral-800 dark:hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
          >
            {pending ? "불러오는 중..." : "더 보기"}
          </button>
        </div>
      )}
    </div>
  );
}
