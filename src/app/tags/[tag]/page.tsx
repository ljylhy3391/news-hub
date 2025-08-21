// 태그별 목록 페이지
// URL 예: /tags/react → params.tag === 'react'
// - 더미 데이터에서 해당 태그를 포함하는 항목만 필터링
// - 추후 ?sort=latest 등의 정렬 옵션을 searchParams로 확장 가능

import { Card } from "@/components/Card";

const all = [
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

type PageProps = {
  params: { tag: string };
  searchParams?: { sort?: string };
};

export default function Page({ params, searchParams }: PageProps) {
  const tag = params.tag;
  const list = all.filter((i) => i.tags.includes(tag));

  const sort = searchParams?.sort ?? "latest";
  // TODO: 추후 sort 값에 따라 정렬 로직 추가

  return (
    <>
      <h1 className="text-2xl font-bold mb-3">태그: {tag}</h1>
      {!list.length ? (
        <p>해당 태그의 항목이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {list.map((i) => (
            <Card key={i.id} item={{ id: i.id, title: i.title, url: i.url }} />
          ))}
        </div>
      )}
    </>
  );
}
