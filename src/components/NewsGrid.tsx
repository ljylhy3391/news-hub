import { NewsCard } from './cards/NewsCard'

export function NewsGrid({ items }: { items: any[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => <NewsCard key={it.id} item={it} />)}
    </div>
  )
}