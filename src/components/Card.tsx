"use client";
import { useBookmarks } from "@/app/hooks/useBookmarks";

export function Card({
  item,
}: {
  item: { id: string; title: string; url?: string };
}) {
  const { has, toggle } = useBookmarks();
  const marked = has(item.id);

  return (
    <div className="border rounded p-4 flex justify-between items-center">
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
      <button
        aria-pressed={marked}
        aria-label={marked ? "북마크 해제" : "북마크 추가"}
        onClick={() => toggle(item)}
        className={`px-3 py-1 rounded ${
          marked ? "bg-yellow-400" : "bg-gray-200"
        }`}
      >
        {marked ? "★" : "☆"}
      </button>
    </div>
  );
}
