import { expect, test } from "vitest";
import { byNewest, toReleases } from "./releases";

const api = (tag: string, date: string | null, extra = {}) => ({
  tag_name: tag,
  name: `Name ${tag}`,
  published_at: date,
  html_url: `https://github.com/o/r/releases/tag/${tag}`,
  body: `Notes ${tag}`,
  draft: false,
  ...extra,
});

test("maps api releases to entries", () => {
  expect(toReleases([api("v1", "2026-01-01T00:00:00Z")])).toEqual([
    {
      id: "v1",
      title: "Name v1",
      date: new Date("2026-01-01T00:00:00Z"),
      url: "https://github.com/o/r/releases/tag/v1",
      body: "Notes v1",
    },
  ]);
});

test("drops drafts and unpublished releases", () => {
  const out = toReleases([
    api("v1", "2026-01-01T00:00:00Z"),
    api("v2", "2026-02-01T00:00:00Z", { draft: true }),
    api("v3", null),
  ]);
  expect(out.map((r) => r.id)).toEqual(["v1"]);
});

test("falls back to tag for missing name and body", () => {
  const [r] = toReleases([
    api("v1", "2026-01-01T00:00:00Z", { name: "", body: null }),
  ]);
  expect(r.title).toBe("v1");
  expect(r.body).toBe("");
});

test("byNewest sorts entries newest first", () => {
  const entry = (id: string, date: string) => ({
    id,
    data: { date: new Date(date) },
  });
  const out = byNewest([
    entry("v1", "2026-01-01"),
    entry("v3", "2026-03-01"),
    entry("v2", "2026-02-01"),
  ]);
  expect(out.map((r) => r.id)).toEqual(["v3", "v2", "v1"]);
});
