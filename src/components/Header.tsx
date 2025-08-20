"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const path = usePathname();
  const active = (href: string) =>
    path === href
      ? "text-white bg-black rounded px-2 py-1"
      : "text-black dark:text-white";

  return (
    <header className="border-b sticky top-0 bg-white/80 dark:bg-black/50 backdrop-blur z-10">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 bg-yellow-300 px-2 py-1 rounded"
      >
        본문으로 건너뛰기
      </a>
      <nav className="max-w-3xl mx-auto px-4 h-12 flex items-center gap-4">
        <Link className="font-semibold" href="/">
          News Hub
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <Link className={active("/")} href="/">
            홈
          </Link>
          <Link className={active("/bookmarks")} href="/bookmarks">
            북마크
          </Link>
        </div>
      </nav>
    </header>
  );
}
