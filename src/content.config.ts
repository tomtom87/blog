import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { RELEASES_REPO } from "./consts";
import { toReleases } from "./lib/releases";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// Fetched from GitHub at build time. On failure, keeps the last fetched
// releases instead of breaking the build.
const releases = defineCollection({
  loader: {
    name: "github-releases",
    load: async ({ store, logger, parseData, renderMarkdown }) => {
      const url = `https://api.github.com/repos/${RELEASES_REPO}/releases?per_page=100`;
      let api;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        api = await res.json();
      } catch (err) {
        logger.warn(`Couldn't fetch ${RELEASES_REPO} releases: ${err}`);
        return;
      }
      store.clear();
      for (const { id, body, ...data } of toReleases(api)) {
        store.set({
          id,
          data: await parseData({ id, data }),
          rendered: await renderMarkdown(body),
        });
      }
    },
  },
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    url: z.string().url(),
  }),
});

export const collections = { blog, releases };
