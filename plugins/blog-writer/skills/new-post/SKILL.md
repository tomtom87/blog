---
name: new-post
description: Create a new blog post that matches the current blog's format and voice. Use when the user says "new post", "write a post", "add a blog post", "draft a post about X", picks an idea from post-ideas, or invokes /new-post, with or without a title, notes, sources, or a full draft.
---

# New blog post

Works on any Markdown blog (Astro, Hugo, Jekyll, Eleventy, Next.js MDX, ...), or with no blog at all.

## 1. Learn the blog

Before writing, find out how posts work here. Stop as soon as you know enough.

1. Read the project's `CLAUDE.md`, `AGENTS.md` or `README.md` for post rules.
2. Find the posts folder: `src/content/blog/`, `content/posts/`, `_posts/`, `posts/`, or search for `.md`/`.mdx` files with front matter.
3. Find the front-matter schema, if there is one (e.g. `src/content.config.ts` for Astro, archetypes for Hugo). Otherwise copy the fields from the two most recent posts.
4. Note the filename pattern (`my-post.md`, `2026-10-12-my-post.md`, `my-post/index.md`) and where images go.
5. Read one or two recent posts for voice and structure.

**No blog here?** Write a standalone `<slug>.md` in the current folder with `title`, `description`, `date` and `tags` front matter, and tell the user where it is.

## 2. Gather what's missing

Use whatever the user already gave (title, notes, a draft, an idea and sources from `post-ideas`). Ask in one go only for what's still missing:

- **Title** (required)
- **Description**: one sentence. Draft one from the content if not given.
- **Tags**: reuse existing tags where they fit.
- **Draft or publish?** Default to draft if the blog supports drafts.
- **Body**: the user writes it, or you draft it from their notes and sources, in the blog's voice. When sources were given, link to them inline where they're used, and only cite what the sources actually say.

## 3. Write the file

- **Slug**: the title, lowercased, with runs of non-alphanumeric characters turned into `-` and leading/trailing `-` trimmed. Keep it short; drop filler words past about 6 words. If the project has its own slug helper, match it.
- If the target file already exists, stop and ask. Never overwrite a post.
- Date is today, in the format existing posts use.
- Match the existing front matter exactly: same field names, order, quoting and date format. Quote values that contain `:` or `#`.
- Don't add a `# h1` in the body if the layout already renders the title (check an existing post).

## 4. Images (optional)

- Follow the blog's existing image convention. Every image needs real alt text.
- Ask before downloading anything. For Creative Commons images, add a credit line: title, author and license, each linked.

## 5. Verify

1. If the project has a build or check command (`npm run build`, `hugo`, `bundle exec jekyll build`, ...), run it. A schema mismatch usually fails here.
2. If a dev server is easy to run, open the post's URL and check it renders. Drafts are often hidden, so say so rather than forcing it live.
3. Run the project's formatter if it has one.
4. Commit only if the user asks, with a message like `Add post: <title>`.

## Publishing an existing draft

Flip the draft flag (or move the file out of the drafts folder, depending on the blog), update the date if the user wants it dated by publish day, then build and check it appears on the index and in the feed.
