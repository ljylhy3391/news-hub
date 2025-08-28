import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 기존 해외 소스
      { protocol: "https", hostname: "cdn.vox-cdn.com" },
      { protocol: "https", hostname: "platform.theverge.com" },
      { protocol: "https", hostname: "techcrunch.com" },
      { protocol: "https", hostname: "static.techcrunch.com" },
      { protocol: "https", hostname: "i0.wp.com" },

      // 한국 소스(이번 에러 원인)
      { protocol: "https", hostname: "flexible.img.hani.co.kr" }, // 한겨레 flexible CDN
      // 필요 시 아래 후보도 실제 네트워크에서 보이면 추가
      // { protocol: 'https', hostname: 'img.hani.co.kr' },
      // { protocol: 'https', hostname: 'img.yna.co.kr' },
      // { protocol: 'https', hostname: 'ichef.bbci.co.uk' },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
