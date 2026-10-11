---
name: new-post
description: Create a new blog post for this Astro site. Use when the user says "new post", "write a post", "add a blog post", "draft a post about X", or invokes /new-post, with or without a title, notes, or a full draft.
---

# New blog post

Posts are Markdown files in `src/content/blog/`. The filename is the URL: `my-post.md` becomes `/blog/my-post/`. The schema lives in `src/content.config.ts`, so the front matter must match it exactly.

## 1. Gather what's missing

Use whatever the user already gave (title, notes, a pasted draft, tags). Ask in one go only for what's still missing:

- **Title** (required)
- **Description**: one sentence, used in post cards, meta tags and RSS. Draft one from the content if the user doesn't give one.
- **Tags**: reuse existing tags where they fit. List them with:
  `grep -h "^tags:" src/content/blog/*.md | sort -u`
- **Draft or publish?** Default to `draft: true` unless the user says to publish.
- **Body**: the user writes it, or Claude drafts it from their notes. When drafting, match the voice of the existing posts: short, practical, first person, `##` subheadings, no fluff.

## 2. Write the file

- **Slug**: the title, lowercased, with runs of non-alphanumeric characters turned into `-` and leading/trailing `-` trimmed. This matches `tagSlug` in `src/lib/tags.ts`. Keep it short; drop filler words if it runs past about 6 words.
- If `src/content/blog/<slug>.md` already exists, stop and ask; never overwrite a post.
- Date is today, `YYYY-MM-DD`.

```markdown
---
title: "Post title"
description: "One-sentence summary."
date: 2026-10-11
tags: [astro, css]
draft: true
---

Opening paragraph. No `# h1` in the body: the layout renders the title as the page's only h1.

## First section
```

Quote `title` and `description` if they contain `:` or `#`.

## 3. Images (optional)

- Put images in `src/assets/blog/<slug>/` and reference them relatively from the post: `![Alt text describing the image](../../assets/blog/<slug>/photo.jpg)`. Astro optimizes them at build time.
- Every image needs real alt text.
- Ask before downloading anything. For Creative Commons images, add a credit line under the image: title, author, and license, each linked.

## 4. Verify

1. Run `npm run build`. It fails if the front matter doesn't match the schema.
2. With `astro dev --background` running, open `http://localhost:4321/blog/<slug>/`. Draft posts are hidden from every route, so to preview one, flip it to `draft: false` temporarily, or say it's a draft and skip the visual check.
3. Run `npm run format`.
4. Commit only if the user asks, with a message like `Add post: <title>` (or `Publish post: <title>` when flipping a draft to live).

## Publishing an existing draft

Set `draft: false`, update `date` to today if the user wants it dated by publish day, then build and check it appears on `/`, `/blog/`, its tag pages, and `/rss.xml`.
