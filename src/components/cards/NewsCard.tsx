export function NewsCard({
  item
}: {
  item: { id: string; title: string; lede?: string; image?: string; tag?: string; url?: string }
}) {
  return (
    <article className="rounded-lg overflow-hidden border bg-white">
      {item.image && <img src={item.image} alt="" className="aspect-video w-full object-cover" />}
      <div className="p-4 space-y-2">
        {item.tag && (
          <span className="inline-block text-xs px-2 py-0.5 rounded bg-sky-50 text-sky-700">
            {item.tag}
          </span>
        )}
        <h3 className="text-lg font-semibold leading-snug line-clamp-2">{item.title}</h3>
        {item.lede && <p className="text-sm text-slate-600 line-clamp-3">{item.lede}</p>}
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
  )
}