// 목적(Purpose)
// - 태그별 목록 페이지입니다. URL의 동적 세그먼트 [tag] 값을 받아
//   allEntries(더미 데이터)에서 해당 태그를 포함한 항목만 필터링해 보여줍니다.
//
// 의도(Intent)
// - Next.js 15 환경에서는 페이지 컴포넌트의 props(params, searchParams)가
//   "값"일 때도 있고 "Promise"일 때도 있습니다(타입 생성 방식 변화).
//   → 두 경우를 모두 안전하게 처리하기 위해 MaybePromise 유틸 타입과
//     resolve() 헬퍼를 사용해 “항상 실제 값”으로 정규화(normalize)합니다.
// - 코드 가독성을 위해 의미가 드러나는 이름(entry, filteredEntries, sortOrder)을 사용합니다.
//
// 사용(Usage)
// - /tags/react           → react 태그가 붙은 항목만 노출
// - /tags/react?sort=...  → sortOrder를 확장할 여지 확보(latest | popular 등)
//
// 확장(Extension)
// - 정렬 로직(sortOrder === 'popular')은 추후 실제 지표(조회/스크랩 수 등)로 교체하세요.
// - allEntries를 실제 데이터 소스(RSS/오픈 API/정적 JSON → 이후 ISR)로 대체하세요.

import { Card } from "@/components/Card";

// 1) 도메인 타입 정의: 항목(Entry)이 무엇인지 명확히 표현
type Entry = { id: string; title: string; url?: string; tags: string[] };

// 2) 더미 데이터(샘플). 실제 데이터로 교체 예정
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

// 3) 값 또는 Promise 양쪽을 포괄하는 유틸 타입/함수
// - Next 15에서 params/searchParams가 Promise로 모델링될 수 있어 방어적으로 수용합니다.
// - resolve()는 값/Promise를 “항상 값”으로 통일(비동기 해소)합니다.
type MaybePromise<T> = T | Promise<T>;
async function resolve<T>(value: MaybePromise<T>): Promise<T> {
  return value;
}

// 4) 라우트 파라미터/검색 파라미터 타입
// - params: /tags/[tag]의 [tag] 값
// - searchParams: ?sort=latest | popular | 그 외 문자열(확장 대비)
type Params = { tag: string };
type Search = { sort?: "latest" | "popular" | string };

// 5) 페이지 컴포넌트(서버 컴포넌트)
// - props의 타입을 MaybePromise로 선언 → Promise/비Promise 모두 대응
// - 내부에서 resolve()로 한 번에 실제 값으로 정규화 → 아래 로직 단순화
export default async function Page({
  params,
  searchParams,
}: {
  params: MaybePromise<Params>;
  searchParams?: MaybePromise<Search>;
}) {
  // 5-1) URL 세그먼트([tag]) 정규화
  // - params가 Promise인 경우 await, 값인 경우 그대로 구조분해
  const { tag } = await resolve(params);

  // 5-2) 쿼리파라미터 정규화
  // - searchParams가 없을 수도 있으므로 optional 처리
  const resolvedSearch = searchParams ? await resolve(searchParams) : undefined;

  // 5-3) 정렬 기본값을 'latest'로 설정
  // - ESLint 경고(선언만 하고 미사용)를 피하기 위해 실제로 사용합니다.
  const sortOrder = resolvedSearch?.sort ?? "latest";

  // 6) 필터링: 태그 포함 여부로 추려냄
  // - 구조분해로 tags만 꺼내 가독성 향상
  let filteredEntries = allEntries.filter(({ tags }) => tags.includes(tag));

  // 7) 정렬: 확장 포인트
  // - popular: TODO(추후 지표 기반 정렬 로직)
  // - latest : 예시로 id 내림차순(숫자형으로 변환 후 비교)
  if (sortOrder === "popular") {
    // TODO: 인기순 로직(예: 조회수/스크랩수 기준 정렬)
    filteredEntries = filteredEntries;
  } else {
    filteredEntries = [...filteredEntries].sort(
      (a, b) => Number(b.id) - Number(a.id)
    );
  }

  // 8) 렌더링
  // - 빈 상태(해당 태그 항목 없음)도 명확히 처리
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
