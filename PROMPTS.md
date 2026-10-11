# Prompts used to build this site

This site was built with [Claude Code](https://claude.com/claude-code) across three sessions. These are the prompts I typed, in order and unedited (typos included). Claude's replies, plans and code are in the git history.

## Session 1: CLAUDE.md and the slice plan

**1. Write CLAUDE.md, after interviewing me first**

```text
I'm starting a new project from scratch: a personal website with a blog. I'm filming this for a YouTube video, so keep things simple and easy to follow.

Before writing anything, interview me to fill gaps (e.g. my name/what the site is about, design vibe, where it'll be hosted). Then create a CLAUDE.md in the project root. Don't scaffold the app yet — CLAUDE.md only.

Assume this stack unless my answers change it:
- Astro + TypeScript, Markdown blog posts in src/content/blog
- Tailwind CSS
- Vitest for tests, Prettier for formatting
- npm

CLAUDE.md should be short (under ~60 lines) and include:
1. One-line project overview
2. Commands: dev, build, test, format
3. Project structure: where pages, layouts, components, and posts live
4. Blog post front-matter schema: title, description, date, tags, draft
5. Rules:
   - Build one feature at a time; don't add features I didn't ask for
   - Draft posts must never appear on the index, tag pages, or RSS
   - Every new piece of logic (sorting, filtering, slugs, reading time, RSS) gets a Vitest test
   - Keep dependencies minimal; prefer Astro built-ins
   - Accessible, semantic HTML; mobile-first
   - Never edit .env files
6. Workflow: use plan mode for each feature, run tests before saying a feature is done, small commits with clear messages

Write it for Claude to read, not humans: direct, terse, no fluff.
```

**2. Plan the build in slices**

```text
Read CLAUDE.md. We're building the site in slices, one feature at a time.

First, propose a plan for the whole site broken into 4–6 slices, in build order. Each slice should be small enough to finish and test on its own. Something like:
1. Scaffold + base layout (header, footer, home page)
2. Blog: content collection, post page, blog index (drafts hidden, newest first)
3. Tags: tag pages + tag list on posts
4. RSS feed + reading time
5. About/contact page + SEO meta

Before finalizing, ask me any questions you need answered (design, content, URLs, anything ambiguous). Don't write any code yet.

Then give me a detailed plan for slice 1 only: files to create, commands to run, and what "done" looks like (including which tests exist and pass).
```

**3. Hand off to a fresh session**

```text
Nice, output a reset prompt for proceeding with slice two that I can put into this context. And let's go.
```

## Session 2: building the slices

**4. The reset prompt Claude wrote, pasted into a fresh session**

```text
Read CLAUDE.md and the plan at ~/.claude/plans/pasted-content-id-d179-read-claude-md-sparkling-rainbow.md.

Slice 1 is done and committed (8bf3a71): Astro + Tailwind v4 + Vitest + Prettier scaffold, BaseLayout (skip link, header/main/footer, dark zinc + green accent, mono headings), home page intro, 5 passing layout tests using the Astro Container API (src/layouts/BaseLayout.test.ts). Site constants live in src/consts.ts.

Now do slice 2 (Blog core), using plan mode first:
- `blog` content collection in src/content.config.ts with a zod schema: title, description, date (coerced), tags (default []), draft (default false)
- src/lib/posts.ts: getPublishedPosts(): drops drafts, sorts newest first. This is the only place drafts get filtered.
- /blog index and /blog/[slug] post page (drafts get no route)
- Add a "Blog" nav link to the header, and show recent posts on the home page
- 2–3 sample posts in src/content/blog, including one draft to prove filtering works
- Vitest tests for draft filtering and sorting, with pure logic kept testable outside Astro

Ask me anything ambiguous before finalising the plan (e.g. how many recent posts on home, date format). Done means `npm test` and `npm run build` pass, a browser check at 375px and desktop, `npm run format`, and one commit.
```

**5. Let the rest run in cheaper subagents**

```text
Yeah, let's move forward with slice three, but I want you to do it in a sub-agent, and you can use Sonnet, it's fine. Opus is overkill for this. Um, no need to go into plan mode, just go auto into it, proceed with it in a sub-agent for slice three, and any other slices past that, I want to just let you run. Thanks.
```

**6–7. Quick questions**

```text
uh, the command to run it locally in my terminal.
```

```text
where do I add a post?
```

## Session 3: redesign, photos, fonts and the new-post skill

**8. Make it look good, interviewing me first**

```text
Hey, we've already got a project started in here using Astro and Tailwind, and we've completed a bit of it. It's got some markdown files for the blog posts, and it's all right, but it, to be honest, it doesn't look very good. It's not very interesting. I want you to update it so that the hero image has got some parallax, like when you load up the site, it looks cool. And uh, when you scroll down, it has my post later on, but at the beginning, it has some introduction to what I do. Um, interview me a bit let's get the creative juices flowing i i want to see where we can take this
```

My answers to Claude's interview questions:

- **Hero:** source an image of a mountain horizon, and move away from the dark techy vibe toward something clear and blue, with geometric shapes, gradients and animations.
- **What I do:** agency / consultant.
- **Intro:** a short bio plus a "currently" list.
- **Vibe:** clean and editorial.
- **Mountains:** drawn SVG ridges.
- **Palette:** dawn/dusk blue.
- **Animations:** all of them (load-in, scroll reveals, drifting shapes, hover).

**9. Real photos, better fonts, and a skill for posts**

```text
Pretty good. However, I'd like to see how it looks with actual imagery. The SVG is cool, but like get some real Creative Commons images in there. Because that'll be a lot nicer. And just try and make it look a bit better. I think the fonts need to be local web-safe fonts from Google Fonts. We can add that in. You have permission to add a new package with NPM. Um, let's add that stuff in. And then when you're done with this, let's create a skill so it's easy for me to add new posts to this or for you to add posts. I I'm going to need a skill for that as well.
```

For the follow-up questions, I picked two blue-hour photos from Wikimedia Commons and the Fraunces + Inter font pairing.

**10. Try the skill**

```text
/new-post testing this out for youtube
```

For its questions, I chose a quick placeholder post, published straight away.

**11. Add an image to the post**

```text
add a image to the post to test it out <image URL>
```

**12. Package it up for you**

```text
ok good put all of it and the skill into the repo because I will share this with my viewers, so prepare it all together and update the README, also include the prompts I used from this conversation and the other one in this project
```
