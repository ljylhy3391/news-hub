import Parser from "rss-parser";
import he from "he";
import type { Entry } from "@/types/news";

// ===== 설정(로그 범위) =====
const DEBUG_MAX_MATCH_SAMPLES = 5; // 매칭 경로 샘플(어느 패스로 잡혔는지)

type ParsedItem = {
  enclosure?: { url?: string };
  ["media:content"]?: { url?: string } | string;
  ["media:thumbnail"]?: { url?: string } | string;
  ["content:encoded"]?: string;
  mediaContent?: { url?: string } | string;
  mediaThumbnail?: { url?: string } | string;
  contentEncoded?: string;
  isoDate?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  link?: string;
  title?: string;
};

const parser = new Parser<ParsedItem>({
  headers: { "User-Agent": "NewsHub/1.0" },
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["content:encoded", "contentEncoded"],
      "enclosure",
      "isoDate",
      "pubDate",
    ],
  },
});

// 보조 정규식들
const reAnyImgUrl = /\bhttps?:\/\/[^\s"'()]+/i;
const reImgUrlWithExt =
  /\bhttps?:\/\/[^\s"']+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^"' ]*)?/i;
const reImgSrc = /<img[^>]+src=["']([^"']+)["']/i;
const reImgSrcset = /<img[^>]+srcset=["']([^"']+)["']/i;
const reOgImage1 =
  /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["'][^>]*>/i;
const reOgImage2 =
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["'][^>]*>/i;
const reTwImage1 =
  /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["'][^>]*>/i;
const reTwImage2 =
  /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["'][^>]*>/i;
const reBgImage =
  /background-image\s*:\s*url\((['"]?)(https?:\/\/[^)"']+)\1\)/i;

const pickUrl = (v?: { url?: string } | string): string | undefined =>
  typeof v === "string" ? v : v?.url;

function normalizeProtocol(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const cleaned = url.trim().replace(/&amp;/g, "&");
  if (cleaned.startsWith("//")) return "https:" + cleaned;
  return cleaned;
}

// srcset에서 가장 큰 w 후보(없으면 첫 후보) 선택
function pickFromSrcset(srcset: string): string | undefined {
  const candidates = srcset
    .split(",")
    .map((s) => s.trim())
    .map((s) => {
      const [u, sz] = s.split(/\s+/);
      const w = sz?.endsWith("w") ? parseInt(sz) : undefined;
      return { u, w };
    })
    .filter((x) => !!x.u);
  if (!candidates.length) return undefined;
  candidates.sort((a, b) => (b.w ?? 0) - (a.w ?? 0));
  return normalizeProtocol(candidates[0].u);
}

// content HTML에서 대표 이미지 한 장 선택(메타 우선)
function extractImageFromHtml(html: string): { url?: string; via?: string } {
  // 1) og:image / og:image:secure_url
  let m = html.match(reOgImage1) || html.match(reOgImage2);
  if (m?.[1]) {
    const u = normalizeProtocol(m[1]);
    if (u) return { url: u, via: "og:image" };
  }

  // 2) twitter:image / twitter:image:src
  m = html.match(reTwImage1) || html.match(reTwImage2);
  if (m?.[1]) {
    const u = normalizeProtocol(m[1]);
    if (u) return { url: u, via: "twitter:image" };
  }

  // 3) img srcset
  const mSrcset = reImgSrcset.exec(html);
  if (mSrcset?.[1]) {
    const u = pickFromSrcset(mSrcset[1]);
    if (u) return { url: u, via: "img:srcset" };
  }

  // 4) img src(확장자 포함)
  const mSrc = reImgSrc.exec(html);
  if (mSrc?.[1]) {
    const u = normalizeProtocol(mSrc[1]);
    if (u && /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(u)) {
      return { url: u, via: "img:src" };
    }
  }

  // 5) background-image
  const mBg = reBgImage.exec(html);
  if (mBg?.[2]) return { url: normalizeProtocol(mBg[2]), via: "bg-image" };

  // 6) 텍스트 내 확장자 URL
  const mExt = reImgUrlWithExt.exec(html);
  if (mExt?.[0]) return { url: normalizeProtocol(mExt[0]), via: "text-url" };

  // 7) 확장자 없지만 URL처럼 보이는 링크(최후의 보루)
  const mAny = reAnyImgUrl.exec(html);
  if (mAny?.[0]) return { url: normalizeProtocol(mAny[0]), via: "text-any" };

  return {};
}

export async function fetchFromRss(source: {
  name: string;
  url: string;
  tag?: string;
}) {
  const feed = await parser.parseURL(source.url);
  const items: ParsedItem[] = (feed.items as ParsedItem[] | undefined) ?? [];
  const top = items.slice(0, 30);

  const matchSamples: { title: string; via: string; url: string }[] = [];
  const entries: Entry[] = top.map((it, idx) => {
    const link = it.link || "";
    const rawTitle = it.title || "";
    const rawSnippet =
      it.contentSnippet ??
      it.contentEncoded ??
      it["content:encoded"] ??
      it.content ??
      "";

    // media 우선 후보(객체/문자열 모두 대응)
    const mc = it.mediaContent ?? it["media:content"];
    const mt = it.mediaThumbnail ?? it["media:thumbnail"];
    const mediaUrl = normalizeProtocol(pickUrl(mc) ?? pickUrl(mt));

    // 우선순위: enclosure → media → HTML에서 추출
    let image = it.enclosure?.url;
    let via = "enclosure";

    if (!image && mediaUrl) {
      image = mediaUrl;
      via = "media";
    }

    if (!image) {
      const { url, via: v } = extractImageFromHtml(String(rawSnippet));
      image = url;
      via = v ?? "none";
    }

    // 최종 안전화(프로토콜 상대, 엔티티 등)
    image = normalizeProtocol(image);
    // data: URL 등 비정상 패턴 스킵
    if (image && /^data:/i.test(image)) {
      image = undefined;
    }

    const pubDate = it.isoDate
      ? new Date(it.isoDate).getTime()
      : it.pubDate
      ? new Date(it.pubDate).getTime()
      : Date.now() - idx * 60000;

    const entry: Entry = {
      id: `${source.name}-${pubDate}-${idx}`,
      title: he.decode(rawTitle),
      lede: he
        .decode(String(rawSnippet).replace(/\s+/g, " ").trim())
        .slice(0, 180),
      url: link || "#",
      image,
      tags: source.tag ? [source.tag] : [],
      source: source.name,
      timeAgo: "",
      pubDate,
    };

    // 항목별 상세 로그(개발/프리뷰에서만)
    // if (DEBUG_PER_ITEM && process.env.NODE_ENV !== "production") {
    //   // eslint-disable-next-line no-console
    //   console.log("[RSS:ITEM]", source.name, {
    //     title: entry.title.slice(0, 60),
    //     via,
    //     image,
    //   });
    // }

    // 매칭 샘플 기록(최대 N개)
    if (image && matchSamples.length < DEBUG_MAX_MATCH_SAMPLES) {
      matchSamples.push({ title: entry.title.slice(0, 60), via, url: image });
    }

    return entry;
  });

  // 집계 로그(요약 + 개발 시 상세)
  try {

    // 개발/프리뷰에서만 상세
    // if (matchSamples.length && process.env.NODE_ENV !== "production") {
    //   console.log(`[RSS] ${source.name}: match samples`, matchSamples);
    // }

    // if (withImage < total && process.env.NODE_ENV !== "production") {
    //   const noImgTitles = entries
    //     .filter((e) => !e.image)
    //     .slice(0, DEBUG_MAX_NOIMG_SAMPLES)
    //     .map((e) => e.title.slice(0, 60));
    //   console.warn(`[RSS] ${source.name}: NO_IMAGE sample`, noImgTitles);
    // }
  } catch {
    // 로그 오류 무시
  }

  return entries;
}
