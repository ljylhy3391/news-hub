"use client";
import { useLocalStorage } from "./useLocalStorage";

export type BookmarkItem = { id: string; title: string; url?: string };

export function useBookmarks() {
  const [list, setList] = useLocalStorage<BookmarkItem[]>("bookmarks", []);

  const has = (id: string) => list.some((i) => i.id === id);

  const toggle = (item: BookmarkItem) =>
    setList((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );

  return { list, has, toggle };
}
