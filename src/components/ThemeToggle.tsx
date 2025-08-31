"use client";
// 다크 모드 토글(클라이언트 전용)
// - 시스템/브라우저 테마 무시, 저장값만 사용
// - 클릭 시 html에 'dark' 클래스 부착/제거 + color-scheme 동기화
// - 로컬스토리지('theme')와 쿠키('theme')에 동시에 저장

import { useEffect, useState } from "react";

function getInitialThemeFromDom(): "dark" | "light" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export default function ThemeToggle() {
  // 서버가 layout에서 html.class를 설정해주므로,
  // 초기값은 DOM의 현재 상태를 그대로 읽어서 시작하면 SSR/CSR 일치
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    getInitialThemeFromDom()
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark"; // 네이티브 UI 대비/스크롤바 등 동기화
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    try {
      localStorage.setItem("theme", theme);
      // SSR 초기화용: 서버에서 읽을 수 있도록 쿠키도 저장(1년)
      document.cookie = `theme=${theme}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
  }, [theme]);

  const toggle = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === "dark"}
      aria-label={theme === "dark" ? "다크 모드 해제" : "다크 모드 적용"}
      title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="px-2 py-1 rounded border text-sm"
    >
      {theme === "dark" ? "☾ 다크" : "☀︎ 라이트"}
    </button>
  );
}
