import { NextResponse } from "next/server";
import { getFeedEntries } from "@/lib/getFeed";

export const revalidate = 600; // 10분 캐시

export async function GET() {
  try {
    const items = await getFeedEntries(60); // ← 보강(og:image)까지 완료된 목록
    return NextResponse.json({ items }, { status: 200 });
  } catch (e) {
    // 디버그 로그(원하면 주석)
    // console.error('[API] feed error', e)
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
