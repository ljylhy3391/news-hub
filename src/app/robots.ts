export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://news-hub.vercel.app/sitemap.xml",
  };
}
