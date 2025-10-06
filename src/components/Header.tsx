"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MouseEvent, useState } from "react";
import { getTagLabel } from "@/lib/tagLabels";

export default function Header() {
  const pathname = usePathname() ?? "";
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const tagToLink = (tag: string) => ({
    href: `/tags/${tag}`,
    label: getTagLabel(tag),
  });

  // 핵심 4개 카테고리
  const mainCategories = [
    { ...tagToLink("kr"), mode: "prefix" as const },
    { ...tagToLink("tech"), mode: "prefix" as const },
    { href: "/bookmarks", label: "북마크", mode: "prefix" as const },
  ];

  // 더보기 드롭다운에 들어갈 추가 카테고리들
  const moreCategories = [
    tagToLink("business"),
    tagToLink("sports"),
    tagToLink("entertainment"),
    tagToLink("science"),
    tagToLink("health"),
  ];

  const handleDropdownLeave = (event: MouseEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && event.currentTarget.contains(next)) {
      return;
    }
    setIsDropdownOpen(false);
  };

  // Pill 형태의 메뉴 스타일 - 둥근 라운드, 작은 그림자
  const baseLink = [
    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70",
    // 라이트 모드
    "text-slate-700 bg-white/60 hover:bg-white/80 hover:text-slate-900",
    "shadow-sm hover:shadow-md border border-white/20",
    // 다크 모드
    "dark:text-slate-200 dark:bg-neutral-800/60 dark:hover:bg-neutral-800/80 dark:hover:text-white",
    "dark:shadow-lg dark:hover:shadow-xl dark:border-neutral-700/30",
  ].join(" ");

  // 활성 상태: 굵기 + 배경색 동시 강조
  const activeLink = [
    "font-bold text-white bg-sky-600 shadow-lg",
    "hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600",
    "border-sky-500/50 dark:border-sky-400/50",
  ].join(" ");

  const linkProps = (href: string, mode: "exact" | "prefix" = "exact") => {
    const isActive =
      mode === "exact" ? pathname === href : pathname.startsWith(href);
    return {
      className: isActive ? `${baseLink} ${activeLink}` : baseLink,
      "aria-current": isActive ? "page" : undefined,
    } as const;
  };

  return (
    <>
      {/* h-14 높이, 강화된 반투명 배경 + 블러로 상단 고정 느낌 강화 */}
      <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/95 backdrop-blur-md shadow-lg dark:border-neutral-800/50 dark:bg-neutral-900/95">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 bg-yellow-300 px-2 py-1 rounded text-black"
        >
          본문으로 건너뛰기
        </a>

        <nav
          className="mx-auto h-14 max-w-6xl px-4 flex items-center justify-between"
          aria-label="주요"
        >
          {/* 좌측 로고 (홈 역할) */}
          <Link
            className={`font-bold text-lg tracking-tight subpixel-antialiased transition-colors ${
              pathname === "/"
                ? "text-sky-600 dark:text-sky-400"
                : "text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400"
            }`}
            href="/"
            aria-label="News Hub 홈으로"
          >
            News Hub
          </Link>

          {/* 데스크톱 카테고리 메뉴 */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {mainCategories.map(({ href, label, mode = "prefix" }) => (
              <Link key={href} {...linkProps(href, mode)} href={href}>
                {label}
              </Link>
            ))}

            {/* 더보기 드롭다운 */}
            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={baseLink}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                더보기
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-48 pt-2 z-50">
                  <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-slate-200 dark:border-neutral-700 py-2">
                    {moreCategories.map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="메뉴 열기"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </nav>
      </header>

      {/* 모바일 드로어 */}
      {isMobileDrawerOpen && (
        <>
          {/* 오버레이 */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* 드로어 */}
          <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-neutral-900 shadow-xl z-50 md:hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-neutral-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                메뉴
              </h2>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="메뉴 닫기"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                  주요 카테고리
                </h3>
                <div className="space-y-2">
                  {mainCategories.map(({ href, label, mode = "prefix" }) => (
                    <Link
                      key={href}
                      {...linkProps(href, mode)}
                      href={href}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="block"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                  더보기
                </h3>
                <div className="space-y-2">
                  {moreCategories.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="block px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                      onClick={() => setIsMobileDrawerOpen(false)}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 드롭다운 외부 클릭 시 닫기 */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </>
  );
}
