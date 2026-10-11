import { getCollection } from "astro:content";

type Post = { data: { date: Date; draft: boolean } };

// Drops drafts and sorts newest first. The only place drafts are filtered.
export function publishedOnly<T extends Post>(posts: T[]): T[] {
  return posts
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getPublishedPosts() {
  return publishedOnly(await getCollection("blog"));
}
