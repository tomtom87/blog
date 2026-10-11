---
title: Building this site with Astro
description: A static Astro site, Tailwind, and a single helper that keeps drafts out of every page.
date: 2026-10-05
tags: [astro, typescript]
---

This site is plain static HTML built with [Astro](https://astro.build). Posts are Markdown files in a content collection, validated with a zod schema.

## Keeping drafts out

Every page that lists posts goes through one helper:

```ts
export function publishedOnly<T extends Post>(posts: T[]): T[] {
  return posts
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
```

One place to filter means one place to test, and no page can forget to do it.
