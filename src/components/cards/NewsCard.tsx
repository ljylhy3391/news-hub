import Image from "next/image";
import type { Entry } from "@/types/news";

export function NewsCard({ item }: { item: Entry }) {
  return (
    <article className="rounded-lg overflow-hidden border bg-white text-slate-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100">
      {item.image ? (
        <Image
          src={item.image}
          alt=""
          width={1200}
          height={675}
          sizes="(max-width: 640px) 100vw, 400px"
        />
      ) : (
        <div className="aspect-video w-full bg-slate-200/10" />
      )}
      <div className="p-4 space-y-2">
        {item.tags?.[0] && (
          <span className="inline-block text-xs px-2 py-0.5 rounded leading-[1] bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
            {item.tags[0]}
          </span>
        )}
        {/* 살짝 축소 버전(옵션) */}
        <h3 className="text-[15px] sm:text-[17px] font-semibold leading-snug line-clamp-2">
          {item.title}
        </h3>
        {item.lede && (
          <p className="text-[13px] sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
            {item.lede}
          </p>
        )}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="text-sky-600 no-underline hover:underline underline-offset-2 decoration-sky-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 rounded-[2px]"
          >
            원문 보기
          </a>
        )}
      </div>
    </article>
  );
}
