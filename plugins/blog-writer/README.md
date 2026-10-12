# blog-writer

A Claude Code plugin that finds something worth writing about, then writes it up in your blog's format and voice. It works with any Markdown blog (Astro, Hugo, Jekyll, Eleventy, Next.js MDX, ...), or with no blog at all.

## Install

In Claude Code:

```text
/plugin install blog-writer --marketplace tomtom87/blog
```

On Claude Code older than 2.1.275, add the marketplace first:

```text
/plugin marketplace add tomtom87/blog
/plugin install blog-writer@tomtom87-blog
```

That's it. The plugin connects the [Exa](https://exa.ai) MCP server for you. It uses Exa's hosted endpoint, which works without an account at a free rate limit.

## Skills

### `/post-ideas [topic]`

1. Works out your beat from the topic you give, or from your existing posts.
2. Runs several Exa searches over the last ~30 days and reads the best results.
3. Names the bigger trend, then pitches 5 post ideas, each with an angle, why it's timely, real source links, and tags.
4. Pick one and it hands off to `/new-post`.

### `/new-post [title, notes or draft]`

1. Learns how posts work in your repo: folder, filename pattern, front-matter fields, image convention, voice.
2. Asks only for what's missing (title, description, tags, draft or published).
3. Writes the post, never overwriting an existing one, and links any sources inline.
4. Runs your build and formatter, if you have them, to check it.

No blog in the current folder? It writes a standalone Markdown file instead.

## Example

```text
/post-ideas AI coding tools
```

```text
/new-post "Writing code is the easy part now" — use idea 2 and its sources
```

## Exa API key (optional)

The free rate limit is fine for occasional use. For heavier use, get a key at [dashboard.exa.ai](https://dashboard.exa.ai/api-keys) and add the server yourself with your key, at user scope so it's not committed anywhere:

```bash
claude mcp add --scope user --transport http exa "https://mcp.exa.ai/mcp?exaApiKey=YOUR_KEY&tools=web_search_exa,web_fetch_exa,web_search_advanced_exa"
```

The skills use whichever Exa tools are available.
