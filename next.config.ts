// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 기존 항목 유지
      { protocol: "https", hostname: "cdn.vox-cdn.com" }, // The Verge CDN(이미 있음)
      { protocol: "https", hostname: "techcrunch.com" },
      { protocol: "https", hostname: "static.techcrunch.com" },
      { protocol: "https", hostname: "i0.wp.com" },
      // 신규 추가(이번 에러의 진짜 원인)
      { protocol: "https", hostname: "platform.theverge.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
