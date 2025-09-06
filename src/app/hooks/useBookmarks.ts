"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { BookmarkItem } from "@/types/news";
import { canonicalizeUrl } from "@/lib/canonicalUrl";

const KEY = "nh.bookmarks";
const MAX = 500;

// 내부: 항목의 비교 키(가능하면 url, 없으면 id)
function keyOf(b: Pick<BookmarkItem, "id" | "url">): string {
  const cu = canonicalizeUrl(b.url);
  return cu ?? `id:${b.id}`;
}

export function useBookmarks() {
  const [list, setList, ready] = useLocalStorage<BookmarkItem[]>(KEY, []);

  // 빠른 조회를 위해 Set 구성
  const setKeys = new Set(list.map((b) => keyOf(b)));

  const has = useCallback(
    (id: string, url?: string) => {
      if (!ready) return false;
      const k = canonicalizeUrl(url) ?? `id:${id}`;
      return setKeys.has(k);
    },
    [ready, setKeys]
  );

  const toggle = useCallback(
    (item: Omit<BookmarkItem, "savedAt">) => {
      if (!ready) return;
      // 최신 스냅샷 기반
      let base = list;
      try {
        const raw = localStorage.getItem(KEY);
        base = raw ? (JSON.parse(raw) as BookmarkItem[]) : list;
      } catch {}

      const newItem = { ...item };
      const kNew = keyOf({ id: newItem.id, url: newItem.url });

      // 존재 여부
      const exists = base.some((b) => keyOf(b) === kNew);
      const next = exists
        ? base.filter((b) => keyOf(b) !== kNew)
        : [{ ...newItem, savedAt: Date.now() }, ...base];

      // dedup(동일 url/id 중복 제거)
      const map = new Map<string, BookmarkItem>();
      for (const b of next) {
        map.set(keyOf(b), b);
      }
      setList(Array.from(map.values()).slice(0, MAX));
    },
    [ready, list, setList]
  );

  const remove = useCallback(
    (id: string, url?: string) => {
      if (!ready) return;
      const k = canonicalizeUrl(url) ?? `id:${id}`;
      setList(list.filter((b) => keyOf(b) !== k));
    },
    [ready, list, setList]
  );

  const clear = useCallback(() => {
    if (!ready) return;
    setList([]);
  }, [ready, setList]);

  return { list, ready, has, toggle, remove, clear };
}
