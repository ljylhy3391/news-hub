export function canonicalizeUrl(input?: string | null): string | undefined {
  if (!input) return undefined;
  try {
    const u = new URL(input);
    u.hash = ""; // # 제거
    u.hostname = u.hostname.toLowerCase();

    // 흔한 트래킹 파라미터 제거
    const drop = new Set([
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "utm_name",
      "gclid",
      "fbclid",
      "igshid",
      "mc_cid",
      "mc_eid",
      "ref",
      "ref_src",
    ]);
    [...u.searchParams.keys()].forEach((k) => {
      if (drop.has(k)) u.searchParams.delete(k);
    });

    // 끝 슬래시 정규화(루트가 아니면 제거)
    if (u.pathname.endsWith("/") && u.pathname !== "/") {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.toString();
  } catch {
    return input || undefined;
  }
}
