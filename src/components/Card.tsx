"use client";
// 단일 카드 컴포넌트
// 하이드레이션 안정화 전략:
// - 서버/클라이언트 초기 출력 불일치를 막기 위해 'mounted' 플래그 사용
// - 마운트 전에는 항상 '북마크 해제 상태(false)'로 렌더 → SSR과 CSR 초기 출력이 동일
// - 마운트(useEffect 이후)에 실제 상태(localStorage)로 갱신하여 깜빡임/경고 방지

import { useEffect, useState } from "react";
import { useBookmarks } from "@/app/hooks/useBookmarks";

type Item = { id: string; title: string; url?: string };

export function Card({ item }: { item: Item }) {
  const { has, toggle } = useBookmarks();

  // 마운트 여부를 추적해 SSR/C SR 출력 차이를 없앱니다.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // 마운트 전에는 무조건 false로 취급하여 서버/클라이언트 초기 출력이 동일하도록 만듭니다.
  const marked = mounted ? has(item.id) : false;

  return (
    <div className="border rounded p-4 flex justify-between items-center">
      {/* 좌측: 제목/원문 링크 */}
      <div className="min-w-0">
        <h3 className="font-medium">{item.title}</h3>
        {item.url && (
          <a
            className="text-blue-600 underline"
            href={item.url}
            target="_blank"
            rel="noreferrer"
          >
            원문 보기
          </a>
        )}
      </div>

      {/* 우측: 북마크 토글 버튼 */}
      <button
        aria-pressed={marked}
        aria-label={marked ? "북마크 해제" : "북마크 추가"}
        onClick={() => toggle(item)}
        className={`px-3 py-1 rounded ${
          marked ? "bg-yellow-400" : "bg-gray-200"
        }`}
        // 버튼 텍스트/스타일도 mounted 이후 실제 상태로 반영되므로
        // 초기 하이드레이션 시점에는 서버와 동일하게 '해제 상태'로 보입니다.
      >
        {marked ? "★" : "☆"}
      </button>
    </div>
  );
}
