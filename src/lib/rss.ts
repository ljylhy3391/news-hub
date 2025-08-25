import Parser from "rss-parser";
import he from "he";
import type { Entry } from "@/types/news";

// RSS 아이템에서 자주 쓰이는 확장 필드 정의
type RssItem = {
  enclosure?: { url?: string };
  ["media:content"]?: { url?: string } | string;
  ["media:thumbnail"]?: { url?: string } | string;
  ["content:encoded"]?: string;
  isoDate?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  link?: string;
  title?: string;
};

// media:content / content:encoded 등을 읽기 위해 customFields 등록
const parser = new Parser<RssItem>({
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

const imageRegex =
  /\bhttps?:\/\/[^\s"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"' ]*)?/i;

export async function fetchFromRss(source: {
  name: string;
  url: string;
  tag?: string;
}) {
  const feed = await parser.parseURL(source.url);
  const items = (feed.items || []).slice(0, 30);

  return items.map((it, idx) => {
    const link = it.link || "";
    const rawTitle = it.title || "";
    const rawSnippet =
      (it as any).contentSnippet ||
      (it as any).contentEncoded || // 워드프레스/버지 계열
      (it as any).content ||
      "";

    // media:content / media:thumbnail는 객체 또는 문자열로 올 수 있음
    const mediaContent = (it as any).mediaContent;
    const mediaThumb = (it as any).mediaThumbnail;
    const mediaUrl =
      (typeof mediaContent === "object" ? mediaContent?.url : mediaContent) ||
      (typeof mediaThumb === "object" ? mediaThumb?.url : mediaThumb);

    const image =
      (it as any)?.enclosure?.url ||
      mediaUrl ||
      imageRegex.exec(String(rawSnippet))?.[0] ||
      undefined;

    const pubDate = it.isoDate
      ? new Date(it.isoDate).getTime()
      : it.pubDate
      ? new Date(it.pubDate).getTime()
      : Date.now() - idx * 60000; // 폴백(최신에 가깝게 퍼짐 방지)

    return {
      id: `${source.name}-${pubDate}-${idx}`, // 시간+인덱스로 충돌 완화
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
    } satisfies Entry;
  });
}
