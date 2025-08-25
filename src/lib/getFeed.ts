import { RSS_SOURCES } from '@/lib/sources'
import { fetchFromRss } from '@/lib/rss'
import type { Entry } from '@/types/news'

/**
 * 여러 RSS 소스로부터 피드 항목을 가져와 병합하고 정렬합니다.
 * @returns 뉴스 항목(Entry)의 배열을 반환하는 Promise.
 */
export async function getFeedEntries(): Promise<Entry[]> {
  // 정의된 모든 RSS 소스에 대해 병렬로 피드를 가져옵니다.
  // Promise.allSettled를 사용하여 일부 피드 가져오기가 실패하더라도 계속 진행합니다.
  const results = await Promise.allSettled(RSS_SOURCES.map(fetchFromRss))

  // 성공적으로 가져온 피드 항목들을 하나의 배열로 병합합니다.
  const merged: Entry[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') {
      merged.push(...r.value)
    }
  }

  // 병합된 항목들을 게시 시각(pubDate)을 기준으로 내림차순 정렬하고,
  // 최신 60개 항목만 반환합니다.
  return merged.sort((a, b) => b.pubDate - a.pubDate).slice(0, 60)
}
