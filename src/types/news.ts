export type Entry = {
  id: string;
  title: string;
  lede: string; // 요약(빈 문자열 허용)
  url: string;
  image?: string; // 이미지가 없을 수도 있어 optional
  tags: string[]; // 최소 한 개(소스 태그) 부여 권장
  source: string;
  timeAgo: string; // 빈 문자열 가능(클라이언트 계산 예정)
  pubDate: number; // 게시 시각 타임스탬프(정렬 기준)
};

export type BookmarkItem = {
  id: string;
  title: string;
  url?: string;
  source?: string;
  savedAt: number;
};