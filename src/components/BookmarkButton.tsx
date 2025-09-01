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
      aria-label={active ? "북마크 해제" : "북마크 추가"}
      title={active ? "북마크 해제" : "북마크 추가"}
      onClick={(e) => {
        e.preventDefault();
        toggle({ id, title, url, source });
      }}
      // 보기 좋은 호버/포커스/스케일/그라데이션
      className={[
        "group px-2.5 py-1.5 rounded-md text-sm transition-colors transition-transform duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70",
        active
          ? "bg-sky-600 text-white hover:bg-sky-700"
          : "bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-neutral-800 dark:text-slate-100 dark:hover:bg-neutral-700",
        "hover:scale-[1.03] active:scale-95 hover:shadow-sm",
        "backdrop-blur-[1px]/[.0]", // 배경 살짝 부드럽게(미세)
      ].join(" ")}
    >
      {/* 아이콘/텍스트 조합: 호버 시 살짝 바뀌는 느낌 */}
      <span className="inline-flex items-center gap-1">
        {/* 비활성: 호버 시 별을 채운 느낌으로 변경 */}
        {!active ? (
          <>
            <span className="transition-opacity group-hover:opacity-0">☆</span>
            <span className="absolute transition-opacity opacity-0 group-hover:opacity-100">
              ★
            </span>
            <span className="pl-4">북마크</span>
          </>
        ) : (
          <>
            <span>★</span>
            <span>저장됨</span>
          </>
        )}
      </span>
    </button>
  );
}
