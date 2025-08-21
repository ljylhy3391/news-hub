"use client";
// 북마크 목록 페이지
// - 로컬 스토리지에서 읽은 리스트를 출력
// - 비어 있을 때 안내 문구 표시

import { useBookmarks } from "@/app/hooks/useBookmarks";

export default function Page() {
  const { list } = useBookmarks();

  if (!list.length) {
    return (
      <p className="p-2">
        아직 북마크가 없습니다. 원하는 카드에서 ☆를 눌러 추가해 보세요.
      </p>
    );
  }

  return (
    <>
      <h1 className="text-xl font-semibold mb-3">내 북마크</h1>
      <ul className="space-y-3">
        {list.map((i) => (
          <li key={i.id} className="border rounded p-3">
            <div className="font-medium">{i.title}</div>
            {i.url && (
              <a
                className="text-blue-600 underline"
                href={i.url}
                target="_blank"
                rel="noreferrer"
              >
                원문 보기
              </a>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
