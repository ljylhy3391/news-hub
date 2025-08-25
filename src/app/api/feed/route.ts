import { NextResponse } from 'next/server'
import { RSS_SOURCES } from '@/lib/sources'
import { fetchFromRss } from '@/lib/rss'
import type { Entry } from '@/types/news'

export const revalidate = 600

export async function GET() {
  try {
    const results = await Promise.allSettled(RSS_SOURCES.map(fetchFromRss))
    const merged: Entry[] = []
    for (const r of results) if (r.status === 'fulfilled') merged.push(...r.value)
    const sorted = merged.sort((a, b) => (a.id < b.id ? 1 : -1)).slice(0, 60)
    return NextResponse.json({ items: sorted }, { status: 200 })
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 })
  }
}