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
    <div className="flex items-end justify-between mb-6">
      {/* 한 단계 축소 + 반응형 보정 */}
      <h2 className="text-xl sm:text-[22px] lg:text-2xl font-bold">{title}</h2>
      {actionHref && (
        <a
          href={actionHref}
          className="text-sky-600 no-underline hover:underline underline-offset-2 decoration-sky-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 rounded-[2px]"
        >
          {actionLabel}
        </a>
      )}
    </div>
  );
}
