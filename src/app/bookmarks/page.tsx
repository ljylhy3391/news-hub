"use client";

import { NewsGrid } from "@/components/NewsGrid";
import { useBookmarks } from "@/app/hooks/useBookmarks";
import { useMemo } from "react";
import type { Entry } from "@/types/news";

export default function BookmarksPage() {
  const { list, ready } = useBookmarks();

  const items: Entry[] = useMemo(() => {
    if (!ready) return [];
    return [...list]
      .sort((a, b) => b.savedAt - a.savedAt)
      .map((b) => ({
        id: b.id,
        title: b.title ?? "",
        lede: "",
        url: b.url || "#",
        image: undefined,
        tags: [],
        source: b.source ?? "",
        timeAgo: "",
        pubDate: b.savedAt,
      }));
  }, [list, ready]);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">북마크</h1>
      {!ready ? (
        <p>불러오는 중…</p>
      ) : items.length ? (
        <NewsGrid items={items} />
      ) : (
        <p>저장된 기사가 없습니다.</p>
      )}
    </main>
  );
}
