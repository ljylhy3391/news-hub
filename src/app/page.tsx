import SectionHeader from '@/components/SectionHeader'
import { HeroCard } from '@/components/cards/HeroCard'
import { NewsGrid } from '@/components/NewsGrid'
import type { Entry } from '@/types/news'
import { getFeedEntries } from '@/lib/getFeed'

/**
 * 메인 페이지 컴포넌트.
 * 서버 사이드에서 뉴스 피드 데이터를 가져와 헤드라인과 최신 기사 목록을 렌더링합니다.
 */
export default async function Page() {
  // 뉴스 피드 항목들을 가져옵니다.
  const items = await getFeedEntries()
  // 첫 번째 항목을 히어로 카드(헤드라인)용으로 사용합니다.
  const hero = items[0]
  // 그 다음 12개 항목을 뉴스 그리드용으로 사용합니다.
  const gridItems = items.slice(1, 13)

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-12">
      {/* 히어로 항목이 있을 경우에만 헤드라인 섹션을 렌더링합니다. */}
      {hero && (
        <>
          <SectionHeader title="헤드라인" />
          <HeroCard item={hero} />
        </>
      )}
      {/* 최신 기사 섹션을 렌더링합니다. */}
      <SectionHeader title="최신 기사" actionHref="/tags/tech" />
      <NewsGrid items={gridItems} />
    </main>
  )
}