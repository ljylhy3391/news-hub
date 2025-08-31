// src/app/tags/[tag]/page.tsx
import { getFeedEntries } from "@/lib/getFeed";
import LoadMore from "./LoadMore";
import { notFound } from "next/navigation";

export const revalidate = 600;

type TagPageProps = {
  // Next.js 15: Promise 타입으로 선언
  params: Promise<{ tag: string }>;
  searchParams: Promise<
    { sort?: "latest" | "popular" | string } & Record<string, string | string[]>
  >;
};

export default async function TagPage({ params, searchParams }: TagPageProps) {
  // 비동기 props 먼저 해제
  const { tag } = await params;
  if (!tag) notFound();

  const { sort: rawSort } = await searchParams;
  const sort = (typeof rawSort === "string" ? rawSort : "latest") ?? "latest";

  // 태그 우선 폴백(필요하면 두 번째 인자 조절: 예) tech는 24)
  const items = await getFeedEntries(60, 13, tag);

  const key = tag.toLowerCase();
  let list = items.filter((e) => e.tags?.some((t) => t.toLowerCase() === key));

  if (sort !== "popular") {
    list = list.sort((a, b) => b.pubDate - a.pubDate || (a.id < b.id ? 1 : -1));
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">태그: {tag}</h1>
      {list.length ? (
        <LoadMore items={list} initialCount={13} step={12} />
      ) : (
        <p>‘{tag}’ 태그의 기사가 없습니다.</p>
      )}
    </main>
  );
}
