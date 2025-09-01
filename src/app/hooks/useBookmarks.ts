"use client";

import { useCallback, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { BookmarkItem } from "@/types/news";

const KEY = "nh.bookmarks";
const LEGACY_KEY = "bookmarks";
const MAX = 500;

// 레거시 북마크(과거 키에 저장되었을 수 있는 형태) 타입 가드
type LegacyBookmark = Partial<
  Pick<BookmarkItem, "id" | "title" | "url" | "source" | "savedAt">
>;
function isLegacyBookmark(v: unknown): v is LegacyBookmark {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === "string"; // id만 있어도 유효로 간주
}

export function useBookmarks() {
  const [list, setList] = useLocalStorage<BookmarkItem[]>(KEY, []);

  // 1) 과거 키에서 현재 키로 1회 이관 + savedAt 보정
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      if (!raw) return;

      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        localStorage.removeItem(LEGACY_KEY);
        return;
      }

      const now = Date.now();
      const merged: BookmarkItem[] = [];
      const seen = new Set<string>();

      for (const v of parsed) {
        if (!isLegacyBookmark(v) || !v.id || seen.has(v.id)) continue;
        seen.add(v.id);
        merged.push({
          id: v.id,
          title: v.title ?? "",
          url: v.url,
          source: v.source,
          savedAt: typeof v.savedAt === "number" ? v.savedAt : now,
        });
      }

      if (merged.length) {
        setList((prev) => {
          const map = new Map<string, BookmarkItem>();
          [...merged, ...prev].forEach((b) => {
            if (!map.has(b.id)) map.set(b.id, b);
          });
          return Array.from(map.values()).slice(0, MAX);
        });
      }
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      // 무시
    }
  }, []);

  // 2) savedAt 누락 보정
  useEffect(() => {
    if (!Array.isArray(list)) return;
    const needs = list.some((b) => typeof b.savedAt !== "number");
    if (needs) {
      const now = Date.now();
      setList(
        list.map((b) =>
          typeof b.savedAt === "number" ? b : { ...b, savedAt: now }
        )
      );
    }
  }, []);

  // 포함 여부
  const has = useCallback(
    (id: string) => list.some((i) => i.id === id),
    [list]
  );

  // 토글(추가 시 savedAt은 내부에서 채움)
  const toggle = useCallback(
    (item: Omit<BookmarkItem, "savedAt">) => {
      setList((prev) => {
        const exists = prev.some((i) => i.id === item.id);
        if (exists) return prev.filter((i) => i.id !== item.id);
        return [{ ...item, savedAt: Date.now() }, ...prev].slice(0, MAX);
      });
    },
    [setList]
  );

  const remove = useCallback(
    (id: string) => {
      setList((prev) => prev.filter((i) => i.id === id));
    },
    [setList]
  );

  const clear = useCallback(() => setList([]), [setList]);

  return { list, has, toggle, remove, clear };
}
