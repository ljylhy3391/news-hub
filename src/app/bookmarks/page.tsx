"use client";
import { useEffect, useState } from "react";
import { NewsGrid } from "@/components/NewsGrid";
import { useBookmarks } from "@/app/hooks/useBookmarks";
import type { Entry } from "@/types/news";

export default function Page() {
  const { list } = useBookmarks();
  const [items, setItems] = useState<Entry[]>([]);
  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((d) => setItems(d.items as Entry[]))
      .catch(() => setItems([]));
  }, []);
  const ids = new Set(list.map((b) => b.id));
  const bookmarked = items.filter((e) => ids.has(e.id));
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">북마크</h1>
      {bookmarked.length ? (
        <NewsGrid items={bookmarked} />
      ) : (
        <p>저장된 기사가 없습니다.</p>
      )}
    </main>
  );
}
