// ponytail: code blocks and markdown syntax count as words; good enough for an estimate.
export function readingTime(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
