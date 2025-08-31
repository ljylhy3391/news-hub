"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname() ?? "";

  // 네비 항목(필요 시 이 배열만 수정)
  const navItems: { href: string; label: string; mode?: "exact" | "prefix" }[] =
    [
      { href: "/", label: "홈", mode: "exact" },
      { href: "/bookmarks", label: "북마크", mode: "prefix" },
      { href: "/tags/kr", label: "한국", mode: "prefix" },
      { href: "/tags/tech", label: "테크", mode: "prefix" },
    ];

  // 공통 링크 스타일
  const baseLink =
    "px-2 py-1 rounded text-black hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70";
  const activeLink = "text-white bg-black";

  // 활성 처리: exact(정확 일치) 또는 prefix(하위 경로 포함)
  const linkProps = (href: string, mode: "exact" | "prefix" = "exact") => {
    const isActive =
      mode === "exact" ? pathname === href : pathname.startsWith(href);
    return {
      className: isActive ? `${baseLink} ${activeLink}` : baseLink,
      "aria-current": isActive ? "page" : undefined,
    } as const;
  };

  return (
    <header className="border-b sticky top-0 bg-white/80 backdrop-blur z-10">
      {/* 스킵 링크 */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 bg-yellow-300 px-2 py-1 rounded"
      >
        본문으로 건너뛰기
      </a>

      <nav
        className="max-w-3xl mx-auto px-4 h-12 flex items-center gap-4"
        aria-label="주요"
      >
        <Link className="font-semibold" href="/" aria-label="News Hub 홈으로">
          News Hub
        </Link>

        <div className="ml-auto flex items-center gap-3">
          {navItems.map(({ href, label, mode = "exact" }) => (
            <Link key={href} {...linkProps(href, mode)} href={href}>
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
