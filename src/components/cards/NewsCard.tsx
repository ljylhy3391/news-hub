import Image from "next/image";
import type { Entry } from "@/types/news";
import BookmarkButton from "@/components/BookmarkButton";
import { isAnimatedImage } from "@/lib/isAnimatedImage";
import { getTagLabel } from "@/lib/tagLabels";

export function NewsCard({ item }: { item: Entry }) {
  const animated = isAnimatedImage(item.image);

  return (
    <article className="relative rounded-lg overflow-hidden border bg-white text-slate-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100">
      {item.image ? (
        <Image
          src={item.image}
          alt=""
          width={1200}
          height={675}
          sizes="(max-width: 640px) 100vw, 400px"
          unoptimized={animated} // 애니메이션이면 최적화 우회
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="aspect-video w-full bg-slate-200/10" />
      )}

      {/* 태그 배지 - 좌상단 고정 */}
      {item.tags?.[0] && (
        <div className="absolute left-3 top-3 z-10">
          <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-sky-600/90 text-white leading-[1]">
            {getTagLabel(item.tags[0])}
          </span>
        </div>
      )}

      {/* 북마크 버튼 - 우상단 고정 */}
      <div className="absolute right-3 top-3 z-10">
        <BookmarkButton
          id={item.id}
          title={item.title}
          url={item.url}
          image={item.image}
          source={item.source}
        />
      </div>

      <div className="p-4 space-y-2">
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
            rel="noopener noreferrer"
            className="text-sky-600 no-underline hover:underline underline-offset-2 decoration-sky-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 rounded-[2px]"
          >
            원문 보기
          </a>
        )}
      </div>
    </article>
  );
}
