# CLAUDE.md

Personal portfolio + blog for [YOUR NAME]: static Astro site, dark cinematic look, host not chosen yet.

## Stack

Astro + TypeScript (strict), Tailwind CSS, Vitest, Prettier, npm. Static output only, no SSR adapter.
Astro dev-server and docs pointers: @AGENTS.md

## Commands

- `npm run dev`: dev server
- `npm run build`: production build to `dist/`
- `npm test`: Vitest (run once, not watch)
- `npm run format`: Prettier write

## Structure

- `src/pages/`: routes: `index.astro` (home), `about.astro`, `blog/index.astro`, `blog/[slug].astro`, `tags/[tag].astro`, `releases.astro` (Portage releases from GitHub, fetched at build), `rss.xml.ts`
- `src/layouts/`: page shells (`BaseLayout.astro`, `PostLayout.astro`)
- `src/components/`: reusable UI
- `src/content/blog/`: Markdown posts (`.md`)
- `src/content.config.ts`: blog collection schema (zod)
- `src/lib/`: pure TS logic (sorting, filtering, slugs, reading time). All testable without Astro.
- `src/lib/*.test.ts`: Vitest tests next to the code they cover

## Post front-matter

```yaml
title: string # required
description: string # required, used for meta + RSS
date: 2026-10-11 # required, coerced to Date
tags: [astro, ts] # string[], default []
draft: false # boolean, default false
```

## Scope

Pages in scope: Home, About, Blog index, Post, Tag pages, Releases, RSS. Nothing else (no projects page, search, comments, analytics, dark-mode toggle) unless asked.

## Design

Dark, cinematic, motion-driven (direction A from UI UX Pro Max). Black page (#000), near-white text (#fafafa), secondary text #a1a1aa (never darker on black), rules #27272a. One accent: blue-hour blue #60a5fa, for post links and the focus ring. Tokens live in `src/styles/global.css`. Home hero is a full-screen blue-hour mountain photo with parallax, fading into the black page, with the header laid over it. Fonts are self-hosted Google Fonts via Astro's Fonts API (`astro.config.mjs`): Archivo (600/800, tight tracking) for headings, Space Grotesk for body and meta. Photos live in `src/assets/`, rendered with `astro:assets` `<Image>`; CC-licensed photos need a credit on the page that uses them. Motion is CSS-only (keyframes, scroll-driven animations for parallax and post entrances), no animation libraries, and all of it is disabled under prefers-reduced-motion.

## Rules

- Build one feature at a time. Don't add features, pages, or config I didn't ask for.
- Drafts (`draft: true`) never appear on blog index, home, tag pages, post routes, or RSS. Filter through one shared helper in `src/lib/`; never filter inline.
- Every new piece of logic (sorting, filtering, slugs, reading time, RSS items) gets a Vitest test in the same change.
- Minimal dependencies. Prefer Astro built-ins (content collections, `astro:assets`, `@astrojs/rss`). Ask before adding any package.
- Semantic, accessible HTML: landmarks, one `h1` per page, alt text, visible focus, sufficient contrast (including text over photos).
- Mobile-first Tailwind: base styles for small screens, `sm:`/`md:` to scale up.
- Never read, create, or edit `.env*` files.

## Workflow

1. Enter plan mode for each feature; get approval before editing.
2. Implement the smallest working version.
3. Run `npm test` and `npm run build`; both must pass before saying a feature is done.
4. Run `npm run format`.
5. Small commits, one feature/fix each, imperative message (e.g. `Add reading time to posts`).
