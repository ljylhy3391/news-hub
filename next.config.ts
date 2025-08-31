// src/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 기존 해외/국내 도메인 유지
      { protocol: "https", hostname: "cdn.vox-cdn.com" },
      { protocol: "https", hostname: "platform.theverge.com" },
      { protocol: "https", hostname: "techcrunch.com" },
      { protocol: "https", hostname: "static.techcrunch.com" },
      { protocol: "https", hostname: "i0.wp.com" },
      { protocol: "https", hostname: "flexible.img.hani.co.kr" },

      // 이번 에러 원인(Guardian 이미지 CDN)
      { protocol: "https", hostname: "i.guim.co.uk" },

      // 필요 시 이미 사용 중이면 함께 추가
      // { protocol: "https", hostname: "media.guim.co.uk" },
      // { protocol: "https", hostname: "ichef.bbci.co.uk" },
      // { protocol: "https", hostname: "img.hani.co.kr" },
      // { protocol: "https", hostname: "img.yna.co.kr" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
