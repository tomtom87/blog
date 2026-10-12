import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getCollection } from "astro:content";
import { beforeAll, expect, test } from "vitest";
import Home from "../pages/index.astro";
import BlogIndex from "../pages/blog/index.astro";
import Post from "../pages/blog/[slug].astro";
import TagPage from "../pages/tags/[tag].astro";
import { getPublishedPosts } from "../lib/posts";
import { postsByTag } from "../lib/tags";

let container: AstroContainer;
let published: Awaited<ReturnType<typeof getPublishedPosts>>;
let draftTitles: string[];

beforeAll(async () => {
  container = await AstroContainer.create({
    astroConfig: { site: "https://example.com" },
  });
  published = await getPublishedPosts();
  draftTitles = (await getCollection("blog"))
    .filter((p) => p.data.draft)
    .map((p) => p.data.title);
});

const h1Count = (html: string) => html.match(/<h1[\s>]/g)?.length ?? 0;

test("fixtures include at least one draft", () => {
  expect(draftTitles.length).toBeGreaterThan(0);
});

test("blog index lists every published post and no drafts", async () => {
  const html = await container.renderToString(BlogIndex);
  expect(h1Count(html)).toBe(1);
  for (const p of published) expect(html).toContain(`href="/blog/${p.id}/"`);
  for (const t of draftTitles) expect(html).not.toContain(t);
});

test("home never shows drafts", async () => {
  const html = await container.renderToString(Home);
  for (const t of draftTitles) expect(html).not.toContain(t);
});

test("home photo credit keeps its spaces", async () => {
  const html = await container.renderToString(Home);
  const text = html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
  expect(text).toContain("Photos: French Alps at Lake Geneva");
  expect(text).toContain("and Kleinarl Jägersee");
  expect(text).toContain("both CC BY-SA 4.0");
});

test("post page has one h1, a dated time and article og:type", async () => {
  const post = published[0];
  const html = await container.renderToString(Post, {
    props: { post },
    params: { slug: post.id },
  });
  expect(h1Count(html)).toBe(1);
  expect(html).toContain(`datetime="${post.data.date.toISOString()}"`);
  expect(html).toContain('<meta property="og:type" content="article"');
});

test("tag page has one h1 and only posts with that tag", async () => {
  const tag = "meta";
  const tagged = postsByTag(published, tag);
  const html = await container.renderToString(TagPage, {
    props: { posts: tagged },
    params: { tag },
  });
  expect(h1Count(html)).toBe(1);
  expect(tagged.length).toBeGreaterThan(0);
  for (const p of published) {
    const link = `href="/blog/${p.id}/"`;
    if (tagged.includes(p)) expect(html).toContain(link);
    else expect(html).not.toContain(link);
  }
});
