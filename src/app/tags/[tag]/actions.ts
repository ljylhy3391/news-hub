"use server";

import { getFeedEntries } from "@/lib/getFeed";
import type { Entry } from "@/types/news";

type Params = {
  tag: string;
  offset: number; // 현재까지 노출한 개수
  count: number; // 이번에 더 가져올 개수
  sort?: "latest" | "popular" | string;
};

export async function fetchMoreEntries({
  tag,
  offset,
  count,
  sort = "latest",
}: Params): Promise<{ items: Entry[]; nextOffset: number; hasMore: boolean }> {
  const TOTAL = 60;
  const enrichLimit = Math.min(TOTAL, offset + count);

  const all = await getFeedEntries(TOTAL, enrichLimit, tag);

  const key = tag.toLowerCase();
  let list = all.filter((e) => e.tags?.some((t) => t.toLowerCase() === key));

  if (sort !== "popular") {
    list = list.sort((a, b) => b.pubDate - a.pubDate || (a.id < b.id ? 1 : -1));
  }

  const slice = list.slice(offset, offset + count);
  const nextOffset = offset + slice.length;
  const hasMore = nextOffset < list.length;

  return { items: slice, nextOffset, hasMore };
}
