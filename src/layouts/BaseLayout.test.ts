import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, expect, test } from "vitest";
import Home from "../pages/index.astro";
import { SITE_TITLE } from "../consts";

let html: string;

beforeAll(async () => {
  const container = await AstroContainer.create();
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
