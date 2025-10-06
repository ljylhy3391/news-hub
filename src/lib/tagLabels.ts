export const TAG_LABELS = {
  kr: "한국",
  tech: "테크",
  business: "비즈니스",
  sports: "스포츠",
  entertainment: "엔터테인먼트",
  science: "과학",
  health: "건강",
  world: "세계",
} as const;

type TagKey = keyof typeof TAG_LABELS;

export function getTagLabel(tag: string): string {
  const normalized = tag.trim().toLowerCase();
  return TAG_LABELS[normalized as TagKey] ?? tag;
}
