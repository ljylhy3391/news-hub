// 전체 앱의 공통 레이아웃
// - 공통 헤더 포함
// - 기본 메타데이터(title/description) 지정
// - 메인 영역에 id="content"를 두어 Skip 링크와 연결

import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "News Hub",
  description: "태그/검색/북마크가 있는 뉴스 큐레이션",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-white dark:bg-black text-black dark:text-white">
        <Header />
        <main id="content" className="max-w-3xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
