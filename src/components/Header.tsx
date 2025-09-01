"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname() ?? "";

  const navItems: { href: string; label: string; mode?: "exact" | "prefix" }[] =
    [
      { href: "/", label: "홈", mode: "exact" },
      { href: "/bookmarks", label: "북마크", mode: "prefix" },
      { href: "/tags/kr", label: "한국", mode: "prefix" },
      { href: "/tags/tech", label: "테크", mode: "prefix" },
    ];

  // 대비 강화: 다크에서 얇은 필 배경(white/5) 기본 적용 → 호버 시 white/10
  const baseLink = [
    "px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70",
    // 라이트
    "text-slate-900 hover:text-slate-900 hover:bg-slate-100",
    // 다크(기본 밝은 글자 + 살짝 채운 배경)
    "dark:text-slate-100 dark:bg-white/5 dark:hover:bg-white/10",
  ].join(" ");

  // 활성은 강한 반전(라이트: 검정 바탕, 다크: 흰 바탕)
  const activeLink = "text-white bg-black dark:bg-white dark:text-black";

  const linkProps = (href: string, mode: "exact" | "prefix" = "exact") => {
    const isActive =
      mode === "exact" ? pathname === href : pathname.startsWith(href);
    return {
      className: isActive ? `${baseLink} ${activeLink}` : baseLink,
      "aria-current": isActive ? "page" : undefined,
    } as const;
  };

  return (
    // 헤더 배경 불투명도 소폭 상향 + 블러 완화 → 텍스트 선명도 확보
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900/95">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 bg-yellow-300 px-2 py-1 rounded text-black"
      >
        본문으로 건너뛰기
      </a>

      <nav
        className="mx-auto h-12 max-w-5xl px-4 flex items-center gap-4"
        aria-label="주요"
      >
        {/* 로고도 다크 대비 강화 */}
        <Link
          className="font-semibold tracking-tight subpixel-antialiased text-slate-900 dark:text-slate-100"
          href="/"
          aria-label="News Hub 홈으로"
        >
          News Hub
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
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
