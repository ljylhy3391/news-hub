// src/lib/getFeed.ts
import { RSS_SOURCES } from "@/lib/sources";
import { fetchFromRss } from "@/lib/rss";
import type { Entry } from "@/types/news";

// 원문 페이지에서 og:image 등을 추출(타임아웃 짧게)
async function fetchOgImage(
  url: string,
  timeoutMs = 2500
): Promise<string | undefined> {
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(to);
    if (!res.ok) return undefined;
    const html = await res.text();

    // 1) og:image
    const mOg = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    );
    if (mOg?.[1]) return mOg[1].startsWith("//") ? "https:" + mOg[1] : mOg[1];

    // 2) twitter:image
    const mTw = html.match(
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
    );
    if (mTw?.[1]) return mTw[1].startsWith("//") ? "https:" + mTw[1] : mTw[1];

    // 3) 본문 내 첫 img (확장자 포함)
    const mImg = html.match(
      /<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)["']/i
    );
    if (mImg?.[1])
      return mImg[1].startsWith("//") ? "https:" + mImg[1] : mImg[1];

    return undefined;
  } catch {
    return undefined;
  }
}

// 이미지가 없는 항목 일부만 보강
async function resolveMissingImages(
  entries: Entry[],
  limit = 6
): Promise<Entry[]> {
  const targets = entries.filter((e) => !e.image && e.url).slice(0, limit);
  const patched = await Promise.all(
    targets.map(async (e) => {
      const img = await fetchOgImage(e.url);
      return img ? { ...e, image: img } : e;
    })
  );
  const patchedMap = new Map(patched.map((p) => [p.id, p]));
  return entries.map((e) => patchedMap.get(e.id) ?? e);
}

export async function getFeedEntries(limit: number = 60): Promise<Entry[]> {
  const results = await Promise.allSettled(RSS_SOURCES.map(fetchFromRss));

  const merged: Entry[] = [];
  for (const r of results)
    if (r.status === "fulfilled") merged.push(...r.value);

  // 중복 제거
  const byKey = new Map<string, Entry>();
  for (const e of merged) {
    const key = e.id || `${e.source}:${e.url}`;
    if (!byKey.has(key)) byKey.set(key, e);
  }
  const unique = Array.from(byKey.values());

  // 최신 정렬
  unique.sort((a, b) => b.pubDate - a.pubDate || (a.id < b.id ? 1 : -1));

  // ▶ 여기서 상위 6개만 og:image로 보강
  const enriched = await resolveMissingImages(unique, 6);

  return enriched.slice(0, limit);
}
