export default function SectionHeader({
  title,
  actionHref,
  actionLabel = "더보기",
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      {/* 제목 크기: text-xl → text-2xl, 굵기 bold 유지 */}
      <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
      {actionHref && (
        <a
          href={actionHref}
          className="text-slate-400 hover:text-slate-200 no-underline hover:underline underline-offset-2 decoration-slate-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 rounded-[2px] transition-colors duration-200"
        >
          {actionLabel}
        </a>
      )}
    </div>
  );
}
