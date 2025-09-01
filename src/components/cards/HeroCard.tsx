import Image from "next/image";
import type { Entry } from "@/types/news";
import BookmarkButton from "@/components/BookmarkButton";
import { isAnimatedImage } from "@/lib/isAnimatedImage";

type Size = "sm" | "md";

const map = {
  sm: {
    article: "max-w-2xl",
    pad: "p-5 space-y-2.5",
    title: "text-[18px] md:text-[19px] lg:text-[22px]",
    sizes: "(max-width: 640px) 100vw, 640px",
  },
  md: {
    article: "max-w-3xl",
    pad: "p-6 space-y-3",
    title: "text-xl md:text-[22px] lg:text-[26px]",
    sizes: "(max-width: 640px) 100vw, 800px",
  },
} as const;

export function HeroCard({ item, size = "sm" }: { item: Entry; size?: Size }) {
  const m = map[size];
  const animated = isAnimatedImage(item.image);

  return (
    <article
      className={`${m.article} relative rounded-xl overflow-hidden border bg-white text-slate-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100`}
    >
      {item.image ? (
        <Image
          src={item.image}
          alt=""
          width={1200}
          height={675}
          sizes={m.sizes}
          priority={!animated && size === "md"} // 애니면 priority 비권장
          unoptimized={animated} // 애니메이션이면 최적화 우회
          loading={animated ? "lazy" : undefined}
          decoding="async"
        />
      ) : (
        <div className="aspect-video w-full bg-slate-200/10" />
      )}

      <div className="absolute right-3 top-3 z-10">
        <BookmarkButton
          id={item.id}
          title={item.title}
          url={item.url}
          source={item.source}
        />
      </div>

      <div className={m.pad}>
        {item.tags?.[0] && (
          <span className="inline-block text-xs px-2 py-0.5 rounded leading-[1] bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
            {item.tags[0]}
          </span>
        )}

        <h3 className={`${m.title} font-bold leading-snug line-clamp-2`}>
          {item.title}
        </h3>

        {item.lede && (
          <p className="text-[15px] sm:text-base text-slate-600 dark:text-slate-400 line-clamp-3">
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
