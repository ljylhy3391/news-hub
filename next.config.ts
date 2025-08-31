import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 해외 소스
      { protocol: "https", hostname: "cdn.vox-cdn.com" },
      { protocol: "https", hostname: "platform.theverge.com" },
      { protocol: "https", hostname: "techcrunch.com" },
      { protocol: "https", hostname: "static.techcrunch.com" },
      { protocol: "https", hostname: "i0.wp.com" },

      // 한국/국제 소스 (필요 시)
      { protocol: "https", hostname: "flexible.img.hani.co.kr" }, // 한겨레 flexible
      { protocol: "https", hostname: "img.hani.co.kr" }, // 한겨레 일반
      { protocol: "https", hostname: "img.yna.co.kr" }, // 연합뉴스
      { protocol: "https", hostname: "ichef.bbci.co.uk" }, // BBC 이미지 CDN
      // { protocol: 'https', hostname: 'media.guim.co.uk' },      // Guardian 사용 시
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
