import { getFeedEntries } from "@/lib/getFeed";
import LoadMore from "./LoadMore";

export const revalidate = 600;

export default async function Page({
  params,
  searchParams,
}: {
  params: { tag: string };
  searchParams?: { sort?: "latest" | "popular" | string };
}) {
  const { tag } = params;
  const sort = searchParams?.sort ?? "latest";

  // 태그 우선 폴백(tech는 필요 시 getFeed에서 preferTag로 우선 보강됨)
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
