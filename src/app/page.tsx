import SectionHeader from '@/components/SectionHeader'
import { HeroCard } from '@/components/cards/HeroCard'
import { NewsGrid } from '@/components/NewsGrid'
import data from '@/../public/data.json' assert { type: 'json' }

export default function Page() {
  const items = (data as any).items || []
  const hero = items[0]
  const gridItems = items.slice(1, 13) // 필요 개수로 조정

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-10">
      {hero && (
        <>
          <SectionHeader title="헤드라인" />
          <HeroCard item={hero} />
        </>
      )}

      <SectionHeader title="최신 기사" actionHref="/tags/tech" />
      <NewsGrid items={gridItems} />
    </main>
  )
}