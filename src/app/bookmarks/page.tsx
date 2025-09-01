"use client";

import { useEffect, useMemo, useState } from "react";
import { NewsGrid } from "@/components/NewsGrid";
import { useBookmarks } from "@/app/hooks/useBookmarks";
import type { Entry } from "@/types/news";

export default function BookmarksPage() {
  const { list } = useBookmarks();
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/feed")
      .then((r) => r.json())
      .then((d) => {
        if (alive) setItems(d.items as Entry[]);
      })
      .catch(() => {
        if (alive) setItems([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const bookmarked = useMemo(() => {
    if (!items.length || !list.length) return [];
    const byId = new Map(list.map((b) => [b.id, b.savedAt]));
    return items
      .filter((e) => byId.has(e.id))
      .sort((a, b) => byId.get(b.id)! - byId.get(a.id)!);
  }, [items, list]);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">북마크</h1>
        <p>불러오는 중…</p>
      </main>
    );
  }

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
