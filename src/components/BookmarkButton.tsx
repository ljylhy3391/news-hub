"use client";

import { useBookmarks } from "@/app/hooks/useBookmarks";
import { useState } from "react";

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
  const { has, toggle, ready } = useBookmarks();
  const active = ready ? has(id, url) : false;
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "북마크 해제" : "북마크 추가"}
      title={active ? "북마크 해제" : "북마크 추가"}
      onClick={(e) => {
        e.preventDefault();
        if (!ready || busy) return;
        setBusy(true);
        toggle({ id, title, url, source });
        setTimeout(() => setBusy(false), 80);
      }}
      disabled={!ready || busy}
      className={[
        "group px-2.5 py-1.5 rounded-md text-sm transition-colors transition-transform duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70",
        active
          ? "bg-sky-600 text-white hover:bg-sky-700"
          : "bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-neutral-800 dark:text-slate-100 dark:hover:bg-neutral-700",
        !ready || busy
          ? "opacity-60 cursor-not-allowed"
          : "hover:scale-[1.03] active:scale-95 hover:shadow-sm",
      ].join(" ")}
    >
      <span className="inline-flex items-center gap-1">
        {!active ? (
          <>
            <span className="transition-opacity group-hover:opacity-0">☆</span>
            <span className="absolute transition-opacity opacity-0 group-hover:opacity-100">
              ★
            </span>
            <span className="pl-4">{ready ? "북마크" : "로딩 중"}</span>
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
