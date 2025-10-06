"use client";

import { useBookmarks } from "@/app/hooks/useBookmarks";
import { useState } from "react";

export default function BookmarkButton({
  id,
  title,
  url,
  image,
  source,
}: {
  id: string;
  title: string;
  url?: string;
  image?: string;
  source?: string;
}) {
  const { has, toggle, ready } = useBookmarks();
  const active = ready ? has(id, url) : false;
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "저장됨" : "북마크"}
      title={active ? "저장됨" : "북마크"}
      onClick={(e) => {
        e.preventDefault();
        if (!ready || busy) return;
        setBusy(true);
        toggle({ id, title, url, image, source });
        setTimeout(() => setBusy(false), 80);
      }}
      disabled={!ready || busy}
      className={[
        "w-8 h-8 rounded-full text-sm transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70",
        "flex items-center justify-center",
        active
          ? "bg-sky-600 text-white hover:bg-sky-700 shadow-lg"
          : "bg-white/10 text-slate-200 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10",
        !ready || busy
          ? "opacity-60 cursor-not-allowed"
          : "hover:scale-105 active:scale-95",
      ].join(" ")}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
