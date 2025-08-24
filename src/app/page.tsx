import SectionHeader from '@/components/SectionHeader'
import { HeroCard } from '@/components/cards/HeroCard'
import { NewsGrid } from '@/components/NewsGrid'
import type { Entry } from '@/types/news'
import data from '@/../public/data.json' assert { type: 'json' }

type DataFile = { items: Entry[] }

export default function Page() {
  const { items } = (data as DataFile)
  const hero: Entry | undefined = items[0]
  const gridItems: Entry[] = items.slice(1, 13)

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