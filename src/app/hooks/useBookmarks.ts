"use client";
// 북마크 전용 훅
// - 리스트: list
// - 포함 여부: has(id)
// - 토글: toggle(item)

import { useLocalStorage } from "./useLocalStorage";

export type BookmarkItem = {
  id: string;
  title: string;
  url?: string;
  source?: string;
};

export function useBookmarks() {
  // 'bookmarks' 키로 로컬 스토리지에 저장
  const [list, setList] = useLocalStorage<BookmarkItem[]>("bookmarks", []);

  // 특정 id를 가진 항목이 북마크에 있는지 확인
  const has = (id: string) => list.some((i) => i.id === id);

  // 있으면 제거, 없으면 추가(토글)
  const toggle = (item: BookmarkItem) =>
    setList((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );

  return { list, has, toggle };
}
