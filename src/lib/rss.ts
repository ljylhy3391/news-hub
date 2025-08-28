import Parser from "rss-parser";
import he from "he";
import type { Entry } from "@/types/news";

// ===== 설정(로그 범위) =====
const DEBUG_MAX_NOIMG_SAMPLES = 5; // 이미지 없는 항목 제목 샘플
const DEBUG_MAX_MATCH_SAMPLES = 5; // 매칭 경로 샘플(어느 패스로 잡혔는지)
const DEBUG_PER_ITEM = false; // true면 항목별 매칭 결과까지 모두 로그(매우 시끄러움)

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
const reAnyImgUrl = /\bhttps?:\/\/[^\s"'()]+/i; // 폭넓은 URL(확장자 없어도)
const reImgUrlWithExt =
  /\bhttps?:\/\/[^\s"']+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^"' ]*)?/i;
const reProtocolRelative =
  /(?:https?:)?\/\/[^\s"']+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^"' ]*)?/i;
const reImgSrc = /<img[^>]+src=["']([^"']+)["']/i;
const reImgSrcset = /<img[^>]+srcset=["']([^"']+)["']/i;
const reOgImage =
  /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i;
const reBgImage =
  /background-image\s*:\s*url\((['"]?)(https?:\/\/[^)"']+)\1\)/i;

const pickUrl = (v?: { url?: string } | string): string | undefined =>
  typeof v === "string" ? v : v?.url;

function normalizeProtocol(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("//")) return "https:" + url;
  return url;
}

// content HTML에서 가장 신뢰도 높은 이미지 한 장을 고르는 함수
function extractImageFromHtml(html: string): { url?: string; via?: string } {
  // 1) srcset의 첫 URL
  const mSrcset = reImgSrcset.exec(html);
  if (mSrcset?.[1]) {
    const first = mSrcset[1].split(",")[0].trim().split(" ")[0];
    const u = normalizeProtocol(first);
    if (u) return { url: u, via: "srcset" };
  }

  // 2) img src
  const mSrc = reImgSrc.exec(html);
  if (mSrc?.[1]) {
    const u = normalizeProtocol(mSrc[1]);
    if (u) return { url: u, via: "img-src" };
  }

  // 3) og:image 메타
  const mOg = reOgImage.exec(html);
  if (mOg?.[1]) {
    const u = normalizeProtocol(mOg[1]);
    if (u) return { url: u, via: "og-image" };
  }

  // 4) background-image: url(...)
  const mBg = reBgImage.exec(html);
  if (mBg?.[2]) {
    return { url: mBg[2], via: "bg-image" };
  }

  // 5) 텍스트 안의 광범위한 이미지 URL(확장자 포함)
  const mExt = reImgUrlWithExt.exec(html);
  if (mExt?.[0]) {
    return { url: mExt[0], via: "text-ext" };
  }

  // 6) 확장자 없지만 URL처럼 보이는 링크(마지막 보루)
  const mAny = reAnyImgUrl.exec(html);
  if (mAny?.[0]) {
    return { url: mAny[0], via: "text-any" };
  }

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

    const mc = it.mediaContent ?? it["media:content"];
    const mt = it.mediaThumbnail ?? it["media:thumbnail"];
    const mediaUrl = normalizeProtocol(pickUrl(mc) ?? pickUrl(mt));

    // 우선순위: enclosure → media → HTML에서 추출
    let image = it.enclosure?.url;
    let via = "enclosure";
    if (!image) {
      image = mediaUrl;
      via = image ? "media" : via;
    }
    if (!image) {
      const { url, via: v } = extractImageFromHtml(String(rawSnippet));
      image = url;
      via = v ?? "none";
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

    if (DEBUG_PER_ITEM) {
      // 항목별 매칭 경로(시끄러움)
      // eslint-disable-next-line no-console
      console.log("[RSS:ITEM]", source.name, {
        title: entry.title.slice(0, 60),
        via,
        image,
      });
    }
    if (image && matchSamples.length < DEBUG_MAX_MATCH_SAMPLES) {
      matchSamples.push({ title: entry.title.slice(0, 60), via, url: image });
    }

    return entry;
  });

  // 집계 로그
  try {
    const total = entries.length;
    const withImage = entries.filter((e) => !!e.image).length;
    const ratio = total ? ((withImage / total) * 100).toFixed(1) : "0.0";
    console.log(
      `[RSS] ${source.name}: images ${withImage}/${total} (${ratio}%)`
    );

    // 어떤 경로로 매칭되었는지 샘플
    if (matchSamples.length) {
      console.log(`[RSS] ${source.name}: match samples`, matchSamples);
    }

    const hosts = Array.from(
      new Set(
        entries
          .map((e) => e.image)
          .filter((u): u is string => !!u)
          .map((u) => {
            try {
              return new URL(u).hostname;
            } catch {
              return null;
            }
          })
          .filter((h): h is string => !!h)
      )
    );
    if (hosts.length) {
      console.log(`[RSS] ${source.name}: image hosts`, hosts.slice(0, 10));
    }

    if (withImage < total) {
      const noImgTitles = entries
        .filter((e) => !e.image)
        .slice(0, DEBUG_MAX_NOIMG_SAMPLES)
        .map((e) => e.title.slice(0, 60));
      console.warn(`[RSS] ${source.name}: NO_IMAGE sample`, noImgTitles);
    }
  } catch {
    // 로그 오류 무시
  }

  return entries;
}
