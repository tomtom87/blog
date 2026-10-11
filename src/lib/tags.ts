type Tagged = { data: { tags: string[] } };

export function tagSlug(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function uniqueTags(posts: Tagged[]): string[] {
  return [...new Set(posts.flatMap((p) => p.data.tags.map(tagSlug)))]
    .filter(Boolean)
    .sort();
}

export function postsByTag<T extends Tagged>(posts: T[], slug: string): T[] {
  return posts.filter((p) => p.data.tags.some((t) => tagSlug(t) === slug));
}
