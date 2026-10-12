---
name: post-ideas
description: Research timely blog post ideas with Exa web search. Use when the user says "post ideas", "what should I write about", "find me something to blog about", "what's trending in X", or invokes /post-ideas, with or without a topic.
---

# Post ideas

Find what people are writing about right now, then pitch posts the user could write that add their own angle. Every idea is backed by real, recent sources.

## 1. Pick the beat

- If the user gave a topic, use it.
- Otherwise, if this is a blog repo, read the existing posts (titles, tags, descriptions) to infer the beat. Look in the usual places: `src/content/blog/`, `content/posts/`, `_posts/`, `posts/`, or wherever `.md`/`.mdx` files with front matter live.
- If there's nothing to go on, ask once: "What do you write about, and who for?"

Note the titles of existing posts so you don't pitch repeats.

## 2. Search

Use the Exa MCP tools (`web_search_exa`, `web_search_advanced_exa`, `web_fetch_exa`). If they aren't available, say so, point the user to the plugin README to connect Exa, and fall back to the built-in web search.

- Run 4–6 searches one after another (Exa's free tier rate-limits parallel calls), each a different angle on the beat: news, opinion and essays, data and research, practitioner write-ups, contrarian takes.
- Keep it recent. With `web_search_advanced_exa`, set a start published date about 30 days back (today's date minus 30). Otherwise put the month and year in the query.
- If Exa returns a rate-limit error, wait a few seconds and retry once, then fall back to the built-in web search for the rest. Tell the user, and mention the optional API key in the plugin README.
- Fetch the 5–8 most promising results with `web_fetch_exa` and skim them. Don't pitch from headlines alone.

## 3. Find the trend

Read the results side by side and name the one or two bigger shifts they share. A good post connects several sources to a trend; it doesn't just summarise one article.

## 4. Pitch

Give 5 ideas, strongest first. For each:

```markdown
### 1. Working title

**Angle:** the take, in one or two sentences. What does the user add that the sources don't?
**Why now:** the trend or news that makes it timely.
**Tags:** tag-a, tag-b
**Sources:**

- [Title](url): one line on what it contributes
- [Title](url): ...
```

Rules:

- Only cite URLs you actually got back from a search or fetch. Never invent a link, quote, or statistic.
- Prefer primary sources (the study, the announcement, the author's own post) over aggregators.
- Mix the formats: an opinion piece, a how-to, a "what I learned building X" if it fits the user's work.
- End with the macro trend in one sentence.

## 5. Hand off

Ask which idea they want. When they pick one, use the `new-post` skill to draft it, passing the title, angle, tags and the source list so the draft can link to them.
