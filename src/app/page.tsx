import SectionHeader from "@/components/SectionHeader";
import { HeroCard } from "@/components/cards/HeroCard";
import { NewsGrid } from "@/components/NewsGrid";
import { getFeedEntries } from "@/lib/getFeed";
import type { Entry } from "@/types/news"; // ← 유지

export default async function Page() {
  const items = await getFeedEntries();
  // Entry 타입을 한 번이라도 사용하면 no-unused-vars 경고가 사라집니다.
  const hero: Entry | undefined = items[0];
  const gridItems: Entry[] = items.slice(1, 13);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-10">
      {hero && (
        <>
          <SectionHeader title="헤드라인" />
          <HeroCard item={hero} size="sm" />
        </>
      )}
      <SectionHeader title="최신 기사" actionHref="/tags/tech" />
      <NewsGrid items={gridItems} />
    </main>
  );
}
