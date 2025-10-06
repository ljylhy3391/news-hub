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
      { protocol: "https", hostname: "media.guim.co.uk" },
      { protocol: "https", hostname: "ichef.bbci.co.uk" },
      // { protocol: "https", hostname: "img.hani.co.kr" },
      // { protocol: "https", hostname: "img.yna.co.kr" },

      // 새 카테고리 이미지 도메인들
      // 비즈니스
      { protocol: "https", hostname: "static.reuters.com" },
      { protocol: "https", hostname: "media.cnn.com" },

      // 스포츠
      { protocol: "https", hostname: "*.espncdn.com" },
      { protocol: "https", hostname: "e0.365dm.com" },
      { protocol: "https", hostname: "e1.365dm.com" },

      // 엔터테인먼트
      { protocol: "https", hostname: "images.entertainmentweekly.com" },
      { protocol: "https", hostname: "variety.com" },

      // 과학
      { protocol: "https", hostname: "media.springernature.com" },
      { protocol: "https", hostname: "www.sciencedaily.com" },
      { protocol: "https", hostname: "images.newscientist.com" },

      // 건강
      { protocol: "https", hostname: "img.webmd.com" },
      { protocol: "https", hostname: "post.healthline.com" },
      { protocol: "https", hostname: "cdn.medicalnewstoday.com" },

      // 기타 범용 이미지 CDN
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
