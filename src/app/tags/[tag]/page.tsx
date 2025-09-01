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

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { tag } = await params;
  if (!tag) notFound();

  const { sort: rawSort } = await searchParams;
  const sort = typeof rawSort === "string" ? rawSort : "latest";

  const enrichLimit = tag === "tech" ? 24 : 13;
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
        <LoadMore items={list} initialCount={13} step={12} />
      ) : (
        <p>‘{tag}’ 태그의 기사가 없습니다.</p>
      )}
    </main>
  );
}
