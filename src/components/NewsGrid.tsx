import { NewsCard } from "./cards/NewsCard";
import type { Entry } from "@/types/news";

/**
 * 뉴스 항목들을 그리드 형태로 표시하는 컴포넌트.
 * @param {object} props - 컴포넌트 속성.
 * @param {Entry[]} props.items - 표시할 뉴스 항목의 배열.
 */
export function NewsGrid({ items }: { items: Entry[] }) {
  return (
    // 반응형 그리드 레이아웃을 설정합니다.
    // 화면 크기에 따라 컬럼 수가 조정됩니다. (모바일: 1, sm: 2, lg: 3)
    // 카드 간격을 gap-4로 통일합니다.
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* 전달받은 뉴스 항목들을 순회하며 NewsCard 컴포넌트를 렌더링합니다. */}
      {items.map((it) => (
        <NewsCard key={it.id} item={it} />
      ))}
    </div>
  );
}
