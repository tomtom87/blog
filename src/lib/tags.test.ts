import { expect, test } from "vitest";
import { publishedOnly } from "./posts";
import { postsByTag, tagSlug, uniqueTags } from "./tags";

const post = (id: string, tags: string[], draft = false) => ({
  id,
  data: { date: new Date("2026-01-01"), draft, tags },
});

test("tagSlug normalizes", () => {
  expect(tagSlug("Type Script!")).toBe("type-script");
  expect(tagSlug("  Astro ")).toBe("astro");
  expect(tagSlug("a--b__c")).toBe("a-b-c");
  expect(tagSlug("--x--")).toBe("x");
});

test("uniqueTags dedupes variants and sorts", () => {
  const posts = [post("a", ["Astro", "meta"]), post("b", [" astro ", "ts"])];
  expect(uniqueTags(posts)).toEqual(["astro", "meta", "ts"]);
});

test("postsByTag matches by slug and keeps order", () => {
  const posts = [
    post("a", ["Type Script"]),
    post("b", ["x"]),
    post("c", ["type-script"]),
  ];
  expect(postsByTag(posts, "type-script").map((p) => p.id)).toEqual(["a", "c"]);
  expect(postsByTag(posts, "nope")).toEqual([]);
});

test("a draft-only tag produces no tag", () => {
  const posts = publishedOnly([
    post("a", ["astro"]),
    post("d", ["secret"], true),
  ]);
  expect(uniqueTags(posts)).toEqual(["astro"]);
});
