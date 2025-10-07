import { RSS_SOURCES } from "@/lib/sources";
import { fetchFromRss } from "@/lib/rss";
import type { Entry } from "@/types/news";

// ===== 설정(운영 환경에 맞춰 조정하세요)
const ENRICH_TIMEOUT_MS = 2500; // og:image 추출 요청 타임아웃
const ENRICH_LIMIT_DEFAULT = 13; // 상위 N개만 보강
const ENRICH_CONCURRENCY = 4; // 동시 요청 개수 제한
const ENRICH_TTL_MS = 600_000; // 10분 TTL (route revalidate=600과 맞춤)

// ===== 간단 메모리 캐시(서버 프로세스 생존 동안)
const enrichCache = new Map<string, { url?: string; ts: number }>();
const now = () => Date.now();

function getCachedOg(url: string): string | undefined {
  const hit = enrichCache.get(url);
  if (!hit) return undefined;
  if (now() - hit.ts > ENRICH_TTL_MS) {
    enrichCache.delete(url);
    return undefined;
  }
  return hit.url;
}

function setCachedOg(url: string, image?: string) {
  enrichCache.set(url, { url: image, ts: now() });
}

// ===== 유틸
function normalizeUrl(u?: string | null): string | undefined {
  if (!u) return undefined;
  const trimmed = u.trim().replace(/&amp;/g, "&");
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return trimmed;
}



// srcset에서 첫 번째 후보(보통 가장 작거나 선언 순) 또는 가장 큰 w를 선택
function pickFromSrcset(
  srcset: string,
  pickLargest = false
): string | undefined {
  const candidates = srcset
    .split(",")
    .map((s) => s.trim())
    .map((s) => {
      const [url, size] = s.split(/\s+/);
      const w = size?.endsWith("w") ? parseInt(size) : undefined;
      return { url, w };
    })
    .filter((x) => !!x.url);
  if (!candidates.length) return undefined;
  if (pickLargest) {
    candidates.sort((a, b) => (b.w ?? 0) - (a.w ?? 0));
    return normalizeUrl(candidates[0].url);
  }
  return normalizeUrl(candidates[0].url);
}

// HTML에서 대표 이미지 추출(여러 경로 시도)
function extractImageFromHtml(html: string): { url?: string; via?: string } {
  const doc = html;

  // 1) og:image / og:image:secure_url (content 순서 변형 포함)
  const reOg1 =
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["'][^>]*>/i;
  const reOg2 =
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["'][^>]*>/i;
  let m = doc.match(reOg1) || doc.match(reOg2);
  if (m?.[1]) return { url: normalizeUrl(m[1]), via: "og:image" };

  // 2) twitter:image / twitter:image:src
  const reTw1 =
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["'][^>]*>/i;
  const reTw2 =
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["'][^>]*>/i;
  m = doc.match(reTw1) || doc.match(reTw2);
  if (m?.[1]) return { url: normalizeUrl(m[1]), via: "twitter:image" };

  // 3) img srcset(가장 큰 것 우선 시도)
  const reSrcset = /<img[^>]+srcset=["']([^"']+)["']/i;
  m = doc.match(reSrcset);
  if (m?.[1]) {
    const chosen = pickFromSrcset(m[1], true) || pickFromSrcset(m[1], false);
    if (chosen) return { url: chosen, via: "img:srcset" };
  }

  // 4) img src (확장자 포함)
  const reImg =
    /<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^"']*)?)["']/i;
  m = doc.match(reImg);
  if (m?.[1]) return { url: normalizeUrl(m[1]), via: "img:src" };

  // 5) background-image: url(...)
  const reBg = /background-image\s*:\s*url\((['"]?)(https?:\/\/[^)"']+)\1\)/i;
  m = doc.match(reBg);
  if (m?.[2]) return { url: normalizeUrl(m[2]), via: "bg-image" };

  // 6) 텍스트 내 확장자 포함 URL(보루)
  const reExtUrl =
    /\bhttps?:\/\/[^\s"'()]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^"' ]*)?/i;
  m = doc.match(reExtUrl);
  if (m?.[0]) return { url: normalizeUrl(m[0]), via: "text-url" };

  return {};
}

/**
 * 원문 페이지에서 대표 이미지를 추출합니다(og:image → twitter:image → srcset/src → bg-image → 텍스트 URL).
 * - timeoutMs: 개별 요청 타임아웃
 * - 캐시(HOT): 같은 URL 재요청 시 10분간 재사용
 */
async function fetchOgImage(
  url: string,
  timeoutMs = ENRICH_TIMEOUT_MS
): Promise<string | undefined> {
  const cached = getCachedOg(url);
  if (cached !== undefined) return cached;

  const ctrl = new AbortController();
  let timer: NodeJS.Timeout | undefined;
  try {
    timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    if (!res.ok) return undefined;
    const html = await res.text();
    const { url: found } = extractImageFromHtml(html);
    const normalized = normalizeUrl(found);
    setCachedOg(url, normalized);
    return normalized;
  } catch {
    // 필요 시 상세 로그:
    // console.warn('[ENRICH] og:image fetch failed:', url, e)
    return undefined;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * 이미지가 없는 항목 일부만(상위 limit개) og:image로 보강합니다.
 * - 동시성 제한으로 안정화
 */

// 1) resolveMissingImages에 preferTag 추가
async function resolveMissingImages(
  entries: Entry[],
  limit = ENRICH_LIMIT_DEFAULT,
  preferTag?: string
): Promise<Entry[]> {
  // 원래 순서를 잃지 않도록 인덱스 보관
  const indexed = entries.map((e, idx) => ({ e, idx }));

  // 이미지 없는 항목 중에서 우선순위: preferTag 포함 → 원래 순서
  const targets = indexed
    .filter(({ e }) => !e.image && !!e.url)
    .sort((a, b) => {
      const ap = preferTag && a.e.tags?.includes(preferTag) ? 0 : 1;
      const bp = preferTag && b.e.tags?.includes(preferTag) ? 0 : 1;
      return ap - bp || a.idx - b.idx;
    })
    .slice(0, limit);

  // 동시성 제한 로직은 기존 그대로 사용
  const queue = [...targets];
  const patched: { id: string; entry: Entry }[] = [];

  async function worker() {
    const t = queue.shift();
    if (!t) return;
    const img = t.e.url ? await fetchOgImage(t.e.url) : undefined;
    const merged = img ? { ...t.e, image: img } : t.e;
    patched.push({ id: merged.id, entry: merged });
    return worker();
  }

  await Promise.all(
    Array.from({ length: Math.min(ENRICH_CONCURRENCY, queue.length) }, worker)
  );

  const patchedMap = new Map(patched.map((p) => [p.id, p.entry]));
  return entries.map((e) => patchedMap.get(e.id) ?? e);
}

// 2) getFeedEntries에서 preferTag를 인자로 전달
export async function getFeedEntries(
  limit = 60,
  enrichLimit = ENRICH_LIMIT_DEFAULT,
  preferTag?: string,
  filterTag?: string
): Promise<Entry[]> {
  const results = await Promise.allSettled(RSS_SOURCES.map(fetchFromRss));
  const merged: Entry[] = [];
  for (const r of results)
    if (r.status === "fulfilled") merged.push(...r.value);

  const byKey = new Map<string, Entry>();
  for (const e of merged) {
    const key = e.id || `${e.source}:${e.url}`;
    if (!byKey.has(key)) byKey.set(key, e);
  }
  const unique = Array.from(byKey.values());
  unique.sort((a, b) => b.pubDate - a.pubDate || (a.id < b.id ? 1 : -1));

  // preferTag 우선으로 폴백 적용
  const enriched = await resolveMissingImages(unique, enrichLimit, preferTag);

  const normalizedFilter = filterTag?.trim().toLowerCase();
  const filtered = normalizedFilter
    ? enriched.filter((entry) =>
        entry.tags?.some((tag) => tag.toLowerCase() === normalizedFilter)
      )
    : enriched;

  // (선택) 집계 로그 유지
  // console.log('[FEED] enriched images', enriched.filter(e=>!!e.image).length, '/', enriched.length)

  return filtered.slice(0, limit);
}
