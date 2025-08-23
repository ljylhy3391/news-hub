export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">페이지를 찾을 수 없어요</h1>
      <p className="mb-4">주소가 바뀌었거나, 삭제된 페이지일 수 있습니다.</p>
      <a className="text-blue-600 underline" href="/">
        홈으로 돌아가기
      </a>
    </main>
  );
}
