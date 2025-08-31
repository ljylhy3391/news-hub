import { NextResponse } from "next/server";
import { getFeedEntries } from "@/lib/getFeed";

// rss-parser 사용 → Node.js 런타임을 명시해 Edge 배포 이슈 예방
export const runtime = "nodejs";

// 10분마다 백그라운드 재생성
export const revalidate = 600;

export async function GET() {
  try {
    const items = await getFeedEntries(60); // 보강(og:image) 반영된 최종 목록
    return NextResponse.json(
      { items },
      {
        status: 200,
        headers: {
          // 프록시 캐시 지시(필요 시 숫자만 조정)
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
        },
      }
    );
  } catch (e) {
    // 운영 시 원인 추적용 로그(필요하면 주석 처리)
    console.error("[API] /api/feed error:", e);
    return NextResponse.json(
      { items: [] },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
          "X-Feed-Error": "true",
        },
      }
    );
  }
}
