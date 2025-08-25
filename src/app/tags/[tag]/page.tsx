import { NewsGrid } from '@/components/NewsGrid'
import type { Entry } from '@/types/news'

type Params = { tag: string }
type Search = { sort?: 'latest' | 'popular' | string }

async function getFeed() {
  const res = await fetch('/api/feed', { next: { revalidate: 600 } })
  if (!res.ok) return { items: [] as Entry[] }
  return res.json() as Promise<{ items: Entry[] }>
}

export default async function Page({
  params,
  searchParams
}: {
  params: Promise<Params>
  searchParams?: Promise<Search>
}) {
  const { tag } = await params
  const sp = searchParams ? await searchParams : undefined
  const sort = sp?.sort ?? 'latest'

  const { items } = await getFeed()
  let list = items.filter((e) => e.tags?.includes(tag))

  if (sort === 'popular') {
    // TODO: 인기 지표 연결(예: 클릭/북마크 수)
  } else {
    list = [...list].sort((a, b) => (a.id < b.id ? 1 : -1))
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">태그: {tag}</h1>
      {list.length ? <NewsGrid items={list} /> : <p>해당 태그의 기사가 없습니다.</p>}
    </main>
  )
}
