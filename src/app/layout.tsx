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
