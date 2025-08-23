// 태그별 목록 페이지 (Next 15 PageProps와 타입 정합 버전)
// - params, searchParams를 Promise로 고정 → await 후 사용
// - 의미 중심 변수명 및 주석 유지

import { Card } from "@/components/Card";

// 도메인 타입
type Entry = { id: string; title: string; url?: string; tags: string[] };
const allEntries: Entry[] = [
  {
    id: "1",
    title: "Next.js App Router 가이드",
    url: "https://nextjs.org",
    tags: ["next", "react"],
  },
  {
    id: "2",
    title: "React 공식 문서",
    url: "https://react.dev",
    tags: ["react"],
  },
  {
    id: "3",
    title: "웹 접근성 체크리스트",
    url: "https://www.w3.org/WAI/",
    tags: ["a11y", "web"],
  },
];

// 라우트/검색 파라미터 타입
type Params = { tag: string };
type Search = { sort?: "latest" | "popular" | string };

export default async function Page({
  params,
  searchParams,
}: {
  // Next 15 생성 타입과 맞추기 위해 Promise 형태로 고정
  params: Promise<Params>;
  searchParams?: Promise<Search>;
}) {
  // 1) URL 세그먼트 해소
  const { tag } = await params;

  // 2) 쿼리파라미터 해소 + 기본값 처리
  const resolvedSearch = searchParams ? await searchParams : undefined;
  const sortOrder = resolvedSearch?.sort ?? "latest";

  // 3) 태그 필터링
  let filteredEntries = allEntries.filter(({ tags }) => tags.includes(tag));

  // 4) 정렬(확장 포인트)
  if (sortOrder === "popular") {
    // TODO: 인기순 지표 기반 정렬 로직
  } else {
    // latest 예시: id 내림차순
    filteredEntries = [...filteredEntries].sort(
      (a, b) => Number(b.id) - Number(a.id)
    );
  }

  // 5) 렌더링
  return (
    <>
      <h1 className="text-2xl font-bold mb-3">태그: {tag}</h1>

      {!filteredEntries.length ? (
        <p>해당 태그의 항목이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <Card
              key={entry.id}
              item={{ id: entry.id, title: entry.title, url: entry.url }}
            />
          ))}
        </div>
      )}
    </>
  );
}
