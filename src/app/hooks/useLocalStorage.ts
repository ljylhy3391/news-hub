"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const isBrowser = typeof window !== "undefined";

  const read = (): T => {
    if (!isBrowser) return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw != null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  };

  // 클라이언트에선 저장값으로 시작, 서버에선 initial
  const [value, setValue] = useState<T>(() => (isBrowser ? read() : initial));

  // 하이드레이션 완료 여부
  const [ready, setReady] = useState<boolean>(false);
  const hydratedRef = useRef<boolean>(false);

  // 같은 탭 브로드캐스트 채널
  const channel = useMemo(() => `nh:ls:${key}`, [key]);

  // 이벤트 유입으로 인한 setValue 시 재브로드캐스트 방지
  const silentRef = useRef(false);

  // 하이드레이션 직후: 저장소 값으로 보정 + ready=true
  useEffect(() => {
    if (!isBrowser) return;
    hydratedRef.current = true;
    const next = read();
    try {
      if (JSON.stringify(next) !== JSON.stringify(value)) {
        silentRef.current = true;
        setValue(next);
      }
    } finally {
      setReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBrowser, key]);

  // 저장 + 같은 탭 브로드캐스트(ready 이전에는 저장 금지)
  useEffect(() => {
    if (!isBrowser || !hydratedRef.current || !ready) return;
    try {
      const current = window.localStorage.getItem(key);
      const next = JSON.stringify(value);
      if (current !== next) {
        window.localStorage.setItem(key, next);
      }
      if (silentRef.current) {
        silentRef.current = false;
        return;
      }
      window.dispatchEvent(
        new CustomEvent(channel, { detail: value as unknown })
      );
    } catch {
      // 무시
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value, channel, ready]);

  // 다른 탭 동기화
  useEffect(() => {
    if (!isBrowser) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        const next =
          e.newValue == null ? initial : (JSON.parse(e.newValue) as T);
        silentRef.current = true;
        setValue(next);
      } catch {
        silentRef.current = true;
        setValue(initial);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, initial]);

  // 같은 탭 동기화
  useEffect(() => {
    if (!isBrowser) return;
    const onMessage = (e: Event) => {
      const ce = e as CustomEvent;
      silentRef.current = true;
      setValue(ce.detail as T);
    };
    window.addEventListener(channel, onMessage as EventListener);
    return () =>
      window.removeEventListener(channel, onMessage as EventListener);
  }, [isBrowser, channel]);

  return [value, setValue, ready] as const;
}
