import Link from "next/link";

export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">페이지를 찾을 수 없어요</h1>
      <p className="mb-4">주소가 바뀌었거나, 삭제된 페이지일 수 있습니다.</p>
      <Link
        href="/"
        className="text-sky-600 no-underline hover:underline underline-offset-2 decoration-sky-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 rounded-[2px]"
        aria-label="홈으로 돌아가기"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
