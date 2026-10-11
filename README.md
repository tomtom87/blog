# Personal site + blog (built with Claude Code)

A static portfolio and blog built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com), made entirely by prompting [Claude Code](https://claude.com/claude-code) on camera. Every prompt I used is in **[PROMPTS.md](PROMPTS.md)**.

## What's in it

- **Parallax photo hero.** A full-screen photo moves at a different speed from the title as you scroll. It uses pure CSS scroll-driven animations, with no JavaScript and no animation library.
- **Load-in, scroll-reveal and hover animations.** All of them turn off for visitors who prefer reduced motion.
- **Blog.** Markdown posts, tag pages, reading time, an RSS feed, and drafts that never leak onto a page.
- **Self-hosted Google Fonts** (Fraunces, Inter, JetBrains Mono) via Astro's built-in Fonts API.
- **Optimized images** via `astro:assets`, served as responsive WebP.
- **Tests.** Vitest covers the logic: sorting, draft filtering, tags, reading time, RSS.
- **A Claude Code skill for writing posts:** `/new-post`.

## Getting started

Requires Node 22.12+.

```bash
npm install
npm run dev
```

Then open http://localhost:4321.

| Command           | What it does                    |
| ----------------- | ------------------------------- |
| `npm run dev`     | Dev server at `localhost:4321`  |
| `npm run build`   | Production build to `dist/`     |
| `npm run preview` | Preview the production build    |
| `npm test`        | Run the Vitest suite once       |
| `npm run format`  | Format everything with Prettier |

## Make it yours

| What                       | Where                                                   |
| -------------------------- | ------------------------------------------------------- |
| Name, description, socials | `src/consts.ts`                                         |
| Hero tagline and buttons   | `src/components/Hero.astro`                             |
| "What I do" + "Currently"  | `src/pages/index.astro`                                 |
| About page                 | `src/pages/about.astro`                                 |
| Photos                     | `src/assets/` (update the credit line in `index.astro`) |
| Fonts                      | `fonts` in `astro.config.mjs`                           |
| Accent colour              | `--color-accent` in `src/styles/global.css`             |
| Site URL (for RSS/SEO)     | `site` in `astro.config.mjs`                            |

## Writing posts

**With Claude Code:** run `/new-post` followed by a title, rough notes or a full draft:

```text
/new-post why I switched to Astro
```

The skill lives in [`.claude/skills/new-post/SKILL.md`](.claude/skills/new-post/SKILL.md). It:

- asks only for what's missing (description, tags, draft or published)
- creates the file with valid front matter and handles images
- runs the build to check it

**By hand:** add a Markdown file to `src/content/blog/`. The filename becomes the URL.

```markdown
---
title: "My post"
description: "One sentence, used on cards, meta tags and RSS."
date: 2026-10-11
tags: [astro]
draft: false # true keeps it off every page and the RSS feed
---

Post body. Use ## for headings.
```

Post images go in `src/assets/blog/<post-slug>/` and are referenced relatively: `![Alt text](../../assets/blog/<post-slug>/photo.jpg)`.

## Project structure

```text
src/
  assets/            photos, optimized at build time
  components/        Hero, PostList, TagList
  content/blog/      Markdown posts
  content.config.ts  post front-matter schema (zod)
  layouts/           BaseLayout
  lib/               pure TS logic + Vitest tests
  pages/             home, about, blog, tags, rss.xml
  styles/global.css  theme tokens and shared CSS
.claude/skills/      the /new-post skill
CLAUDE.md            project rules Claude follows
PROMPTS.md           every prompt used to build this
```

## Credits

- Hero photo: [French Alps at Lake Geneva during the blue hour](https://commons.wikimedia.org/wiki/File:French_alps_at_Lake_Geneva_during_the_blue_hour_with_reflections.jpg) by Deralpinbergsteiger, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), resized.
- Intro photo: [Kleinarl Jägersee](https://commons.wikimedia.org/wiki/File:Kleinarl_J%C3%A4gersee_20180209.jpg) by Uoaei1, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), resized.
- Test post image (Tux penguins): found via Google Images, licence unknown. Swap it out before reusing this repo for a real site.
