import { Card } from "@/components/Card";

const items = [
  { id: "1", title: "Next.js App Router 가이드", url: "https://nextjs.org" },
  { id: "2", title: "React 공식 문서", url: "https://react.dev" },
];

export default function Page() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">오늘의 콘텐츠</h1>
      <div className="space-y-3">
        {items.map((i) => (
          <Card key={i.id} item={i} />
        ))}
      </div>
    </>
  );
}
