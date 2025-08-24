import { NewsCard } from './cards/NewsCard'
import type { Entry } from '@/types/news'

export function NewsGrid({ items }: { items: Entry[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => <NewsCard key={it.id} item={it} />)}
    </div>
  )
}