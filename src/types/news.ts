// src/types/news.ts
// 프로젝트 공용 데이터 타입 정의
// - Entry: 뉴스/피드의 표준 항목 스키마(서버·클라이언트 공용)
// - BookmarkItem: 로컬 저장용 북마크 항목(클라이언트 전용; savedAt으로 저장순 정렬)
// - FeedResponse: /api/feed 응답 기본 형태
// - 유틸 타입(WithImage): 이미지가 확실히 있는 항목만 다룰 때 사용

/**
 * 뉴스/피드의 표준 항목
 * - 서버(rss.ts/getFeed.ts)에서 만들고, 클라이언트 UI에서 그대로 사용합니다.
 */
export type Entry = {
  id: string;
  title: string;
  lede: string;
  url: string;
  image?: string;
  tags: string[];
  source: string; // 출처 식별용 이름(소스명) 예: 'TheVerge', 'TechCrunch', 'Hani', 'Yonhap'
  timeAgo: string; // 상대 시간 문자열(클라이언트에서 계산 예정) 빈 문자열 가능
  pubDate: number; // 게시 시각(정렬 기준) 타임스탬프(ms) 최신순 정렬: (b.pubDate - a.pubDate)
};

/**
 * 북마크 항목(로컬 스토리지 저장용)
 * - 버튼/훅(useBookmarks)에서 사용
 * - savedAt은 훅 내부에서 Date.now()로만 채웁니다(버튼에서 넘기지 않음).
 */
export type BookmarkItem = {
  id: string;
  title: string;
  url?: string;
  image?: string; // 북마크에서 이미지 보존
  source?: string;
  savedAt: number; // 저장 시각(최신순 정렬에 사용; ms)
};

/**
 * /api/feed 응답 기본 형태
 * - 라우트: NextResponse.json({ items })
 */
export type FeedResponse = {
  items: Entry[];
};

/**
 * 유틸 타입: 이미지가 확실히 있는 항목만 다룰 때
 * - 예: 그리드에서 image가 없는 카드를 제외하고 렌더할 때
 */
export type WithImage<T extends { image?: string }> = T & { image: string };
