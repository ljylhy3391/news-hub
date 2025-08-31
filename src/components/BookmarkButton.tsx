"use client";
import { useBookmarks } from "@/app/hooks/useBookmarks";

export default function BookmarkButton({
  id,
  title,
  url,
  source,
}: {
  id: string;
  title: string;
  url?: string;
  source?: string;
}) {
  const { has, toggle } = useBookmarks();
  const active = has(id);
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        toggle({
          id,
          title,
          url,
          source,
          savedAt: 0,
        });
      }}
      className={`px-2 py-1 rounded text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70
        ${
          active
            ? "bg-sky-600 text-white"
            : "bg-slate-200 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        }`}
      title={active ? "북마크 해제" : "북마크 추가"}
    >
      {active ? "☆ 저장됨" : "☆ 북마크"}
    </button>
  );
}
