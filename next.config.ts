import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image가 허용할 외부 원본 도메인 목록
    remotePatterns: [
      { protocol: "https", hostname: "cdn.vox-cdn.com" }, // The Verge CDN
      { protocol: "https", hostname: "techcrunch.com" }, // TechCrunch 원본
      { protocol: "https", hostname: "static.techcrunch.com" }, // TechCrunch 정적 리소스
      { protocol: "https", hostname: "i0.wp.com" }, // 워드프레스 이미지 프록시
      // 필요 시 여기에 도메인을 추가하세요.
      // 예) { protocol: 'https', hostname: 'media.guim.co.uk' }
    ],
    // 브라우저 지원 시 더 가벼운 포맷 자동 서빙
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
