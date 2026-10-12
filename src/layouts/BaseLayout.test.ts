import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, expect, test } from "vitest";
import Home from "../pages/index.astro";
import { SITE_TITLE } from "../consts";

let html: string;

beforeAll(async () => {
  const container = await AstroContainer.create({
    astroConfig: { site: "https://example.com" },
  });
  html = await container.renderToString(Home);
});

test("sets the page language", () => {
  expect(html).toContain('<html lang="en"');
});

test("has exactly one h1", () => {
  expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
});

test("has header, main and footer landmarks", () => {
  expect(html).toMatch(/<header[\s>]/);
  expect(html).toMatch(/<main id="main"/);
  expect(html).toMatch(/<footer[\s>]/);
});

test("has a skip link to main content", () => {
  expect(html).toMatch(/<a href="#main"/);
});

test("title contains the site title", () => {
  expect(html).toMatch(new RegExp(`<title>[^<]*${SITE_TITLE}[^<]*</title>`));
});

test("has canonical and Open Graph meta", async () => {
  const container = await AstroContainer.create({
    astroConfig: { site: "https://example.com" },
  });
  const page = await container.renderToString(Home, {
    request: new Request("https://example.com/"),
  });
  expect(page).toMatch(/<link rel="canonical" href="https?:\/\/[^"]+\/"/);
  expect(page).toMatch(/<meta property="og:title" content="[^"]*Your Name/);
  expect(page).toMatch(/<meta property="og:description" content="[^"]+"/);
  expect(page).toMatch(/<meta property="og:url" content="https?:\/\/[^"]+\/"/);
  expect(page).toContain('<meta property="og:type" content="website"');
});

test("loads the Archivo and Space Grotesk fonts", () => {
  expect(html).toContain("--font-archivo");
  expect(html).toContain("--font-space-grotesk");
});
