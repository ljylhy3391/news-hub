export function isAnimatedImage(url?: string): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  // 확장자 기준 간단 판별(필요시 webp 애니 쿼리도 추가)
  return u.endsWith(".gif") || u.includes(".gif?") || u.includes("format=gif");
}
