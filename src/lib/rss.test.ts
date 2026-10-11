import { expect, test } from "vitest";
import { publishedOnly } from "./posts";
import { rssItems } from "./rss";

const post = (id: string, date: string, draft = false) => ({
  id,
  data: {
    title: `Title ${id}`,
    description: `Desc ${id}`,
    date: new Date(date),
    draft,
  },
});

test("maps posts to rss items with link and pubDate", () => {
  expect(rssItems([post("a", "2026-01-01")])).toEqual([
    {
      title: "Title a",
      description: "Desc a",
      pubDate: new Date("2026-01-01"),
      link: "/blog/a/",
    },
  ]);
});

test("drafts are excluded when fed through publishedOnly", () => {
  const items = rssItems(
    publishedOnly([post("a", "2026-01-01"), post("b", "2026-02-01", true)]),
  );
  expect(items.map((i) => i.link)).toEqual(["/blog/a/"]);
});
