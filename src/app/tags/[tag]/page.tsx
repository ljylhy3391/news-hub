import { getFeedEntries } from "@/lib/getFeed";
import LoadMore from "./LoadMore";
import { notFound } from "next/navigation";

export const revalidate = 600;

type TagPageProps = {
  params: Promise<{ tag: string }>;
  searchParams: Promise<
    { sort?: "latest" | "popular" | string } & Record<string, string | string[]>
  >;
};

// UI 파라미터
const INITIAL_COUNT = 13;
const STEP = 12;
// 예상 더보기 횟수(필요 시 2 → 3 등으로만 조정)
const EXPECTED_LOADS = 2;

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { tag } = await params;
  if (!tag) notFound();

  const { sort: rawSort } = await searchParams;
  const sort = typeof rawSort === "string" ? rawSort : "latest";

  // 하드코딩 제거: UI 파라미터 기반 동적 보강 한도
  const enrichLimit = Math.min(60, INITIAL_COUNT + STEP * EXPECTED_LOADS);

  const items = await getFeedEntries(60, enrichLimit, tag);

  const key = tag.toLowerCase();
  let list = items.filter((e) => e.tags?.some((t) => t.toLowerCase() === key));

  if (sort !== "popular") {
    list = list.sort((a, b) => b.pubDate - a.pubDate || (a.id < b.id ? 1 : -1));
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">태그: {tag}</h1>
      {list.length ? (
        <LoadMore
          items={list}
          tag={tag}
          sort={sort}
          initialCount={INITIAL_COUNT}
          step={STEP}
        />
      ) : (
        <p>‘{tag}’ 태그의 기사가 없습니다.</p>
      )}
    </main>
  );
}
