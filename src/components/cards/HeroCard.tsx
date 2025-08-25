import Image from "next/image";
import type { Entry } from "@/types/news";

/**
 * 헤드라인 뉴스를 표시하기 위한 큰 카드 컴포넌트 (히어로 카드).
 * @param {object} props - 컴포넌트 속성.
 * @param {Entry} props.item - 표시할 뉴스 항목.
 */
export function HeroCard({ item }: { item: Entry }) {
  // 뉴스 항목에 태그가 있는 경우, 첫 번째 태그만 표시합니다.
  const tags = item.tags ?? [];
  const shown = tags.slice(0, 1); // UI 일관성을 위해 표시할 태그 수를 제한합니다.

  return (
    <article className="rounded-xl overflow-hidden border border-slate-200 bg-white text-slate-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-slate-100">
      {/* 뉴스 항목에 이미지가 있을 경우에만 렌더링합니다. */}
      {item.image && (
        <Image
          src={item.image}
          alt={item.title} // alt 속성에 제목을 추가하여 접근성을 향상시킵니다.
          width={1200}
          height={675} // 16:9 비율
          sizes="(max-width: 640px) 100vw, 800px" // 반응형 이미지 크기
          priority // LCP(Largest Contentful Paint) 최적화를 위해 priority 속성 사용
        />
      )}
      <div className="p-6 space-y-2.5">
        {/* 태그가 있을 경우 표시합니다. */}
        <div className="flex gap-2">
          {shown.map((tag) => (
            <span
              key={tag}
              className="inline-block text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 leading-[1]"
            >
              {tag}
            </span>
          ))}
        </div>
        {/* 뉴스 제목 */}
        <h3 className="text-xl sm:text-2xl font-bold leading-snug line-clamp-2">
          {item.title}
        </h3>
        {/* 뉴스 요약(lede)이 있을 경우 표시합니다. */}
        {item.lede && (
          <p className="text-[15px] sm:text-base text-slate-600 dark:text-slate-400 line-clamp-3">
            {item.lede}
          </p>
        )}
        {/* 원문 링크가 있을 경우 표시합니다. */}
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