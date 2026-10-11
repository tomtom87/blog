import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import About from "../pages/about.astro";
import { SOCIAL_LINKS } from "../consts";

test("about page has one h1 and every social link", async () => {
  const container = await AstroContainer.create({
    astroConfig: { site: "https://example.com" },
  });
  const html = await container.renderToString(About);
  expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
  for (const { href } of SOCIAL_LINKS) expect(html).toContain(`href="${href}"`);
});
