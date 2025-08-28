// 목적: 여러 RSS 소스를 병합 → 최신순 정렬 → (옵션) 상위 N개 기사에 og:image 폴백 적용

import { RSS_SOURCES } from "@/lib/sources";
import { fetchFromRss } from "@/lib/rss";
import type { Entry } from "@/types/news";

/**
 * 원문 페이지에서 대표 이미지를 추출합니다(og:image → twitter:image → 첫 img).
 * - timeoutMs: 개별 요청 타임아웃(기본 2500ms)
 * - 실패 시 undefined를 반환합니다.
 */
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

    // og:image
    const mOg = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    );
    if (mOg?.[1]) return mOg[1].startsWith("//") ? `https:${mOg[1]}` : mOg[1];

    // twitter:image
    const mTw = html.match(
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
    );
    if (mTw?.[1]) return mTw[1].startsWith("//") ? `https:${mTw[1]}` : mTw[1];

    // 본문 첫 img (확장자 포함)
    const mImg = html.match(
      /<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)["']/i
    );
    if (mImg?.[1])
      return mImg[1].startsWith("//") ? `https:${mImg[1]}` : mImg[1];

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * 이미지가 없는 항목 일부만(상위 limit개) og:image로 보강합니다.
 * - 원문 URL이 없거나 추출 실패 시 원본 항목을 그대로 반환합니다.
 */
async function resolveMissingImages(
  entries: Entry[],
  limit = 6
): Promise<Entry[]> {
  const targets = entries.filter((e) => !e.image && !!e.url).slice(0, limit);
  const patched = await Promise.all(
    targets.map(async (e) => {
      const img = await fetchOgImage(e.url);
      return img ? { ...e, image: img } : e;
    })
  );
  const patchedMap = new Map<string, Entry>(patched.map((p) => [p.id, p]));
  return entries.map((e) => patchedMap.get(e.id) ?? e);
}

/**
 * 여러 RSS 소스를 병합·정렬하여 반환합니다.
 * - limit: 최종 반환 개수(기본 60)
 * - enrichLimit: og:image 폴백을 적용할 상위 개수(기본 10)
 */
export async function getFeedEntries(
  limit = 60,
  enrichLimit = 10
): Promise<Entry[]> {
  // 1) 소스 병렬 수집(실패 소스는 건너뜀)
  const results = await Promise.allSettled(RSS_SOURCES.map(fetchFromRss));

  // 2) 성공 항목 병합
  const merged: Entry[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") merged.push(...r.value);
  }

  // 3) 중복 제거(id 우선, 보조 키로 source:url)
  const byKey = new Map<string, Entry>();
  for (const e of merged) {
    const key = e.id || `${e.source}:${e.url}`;
    if (!byKey.has(key)) byKey.set(key, e);
  }
  const unique = Array.from(byKey.values());

  // 4) 최신순 정렬(pubDate ↓, 동률이면 id 보조 정렬)
  unique.sort((a, b) => b.pubDate - a.pubDate || (a.id < b.id ? 1 : -1));

  // 5) 상위 N개만 og:image 폴백 적용(시간/네트워크 부담 최소화)
  const enriched = await resolveMissingImages(unique, enrichLimit);

  // (선택) 보강 후 집계 로그 — 필요 없으면 주석 처리하세요.
  // eslint-disable-next-line no-console
  console.log(
    "[FEED] enriched images",
    enriched.filter((e) => !!e.image).length,
    "/",
    enriched.length
  );

  // 6) 상한 적용 후 반환
  return enriched.slice(0, limit);
}
