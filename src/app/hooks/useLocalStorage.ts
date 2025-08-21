"use client";
// 로컬 스토리지 연동 훅
// - 최초 렌더에서 즉시(local) 값을 읽어 초기값으로 사용
// - value가 바뀔 때만 저장(useEffect)하여 덮어쓰기 문제 방지

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  // 브라우저 환경 여부(서버 컴포넌트에서 실행 방지)
  const isBrowser = typeof window !== "undefined";

  // 초기값을 지연 평가: 렌더 시점에 localStorage 값을 읽어 바로 반영
  const readInitial = () => {
    if (!isBrowser) return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw != null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  };

  // 초기값을 위 함수로 설정 → 마운트 직후에 빈값으로 덮어쓰지 않음
  const [value, setValue] = useState<T>(readInitial);

  // value가 변경될 때만 저장(최초 렌더 시 불필요한 저장 방지)
  useEffect(() => {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 저장 실패는 조용히 무시(예: 스토리지 용량 초과 등)
    }
  }, [isBrowser, key, value]);

  return [value, setValue] as const;
}
