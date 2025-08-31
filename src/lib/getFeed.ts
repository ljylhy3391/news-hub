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

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, " ");
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
  } catch (e) {
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
async function resolveMissingImages(
  entries: Entry[],
  limit = ENRICH_LIMIT_DEFAULT
): Promise<Entry[]> {
  const targets = entries.filter((e) => !e.image && !!e.url).slice(0, limit);

  const queue = [...targets];
  const patched: Entry[] = [];
  async function worker() {
    const e = queue.shift();
    if (!e) return;
    const img = e.url ? await fetchOgImage(e.url) : undefined;
    patched.push(img ? { ...e, image: img } : e);
    return worker();
  }
  await Promise.all(
    Array.from({ length: Math.min(ENRICH_CONCURRENCY, queue.length) }, worker)
  );

  // 패치 결과를 원본에 반영
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
  enrichLimit = ENRICH_LIMIT_DEFAULT
): Promise<Entry[]> {
  // 1) 소스 병렬 수집(실패 소스는 건너뜀)
  const results = await Promise.allSettled(RSS_SOURCES.map(fetchFromRss));

  // 2) 성공 항목 병합
  const merged: Entry[] = [];
  for (const r of results)
    if (r.status === "fulfilled") merged.push(...r.value);

  // 3) 중복 제거(id 우선, 보조 키로 source:url)
  const byKey = new Map<string, Entry>();
  for (const e of merged) {
    const key = e.id || `${e.source}:${e.url}`;
    if (!byKey.has(key)) byKey.set(key, e);
  }
  const unique = Array.from(byKey.values());

  // 4) 최신순 정렬(pubDate ↓, 동률이면 id 보조 정렬)
  unique.sort((a, b) => b.pubDate - a.pubDate || (a.id < b.id ? 1 : -1));

  // 5) 상위 N개만 og:image 폴백 적용
  const enriched = await resolveMissingImages(unique, enrichLimit);

  // (선택) 보강 후 집계 로그
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
