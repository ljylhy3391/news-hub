// 나중에 데이터 소스로 확장 가능

export default function sitemap() {
  const base = "https://news-hub.vercel.app";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now },
    { url: `${base}/bookmarks`, lastModified: now },
    // 대표 태그 예시(필요 시 추가/수정)
    { url: `${base}/tags/react`, lastModified: now },
  ];
}
