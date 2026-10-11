import { expect, test } from "vitest";
import { publishedOnly } from "./posts";

const post = (id: string, date: string, draft = false) => ({
  id,
  data: { date: new Date(date), draft },
});

test("drops drafts", () => {
  const ids = publishedOnly([
    post("a", "2026-01-01"),
    post("b", "2026-02-01", true),
  ]).map((p) => p.id);
  expect(ids).toEqual(["a"]);
});

test("sorts newest first", () => {
  const ids = publishedOnly([
    post("old", "2025-01-01"),
    post("new", "2026-06-01"),
    post("mid", "2025-09-01"),
  ]).map((p) => p.id);
  expect(ids).toEqual(["new", "mid", "old"]);
});

test("does not mutate the input", () => {
  const input = [post("old", "2025-01-01"), post("new", "2026-01-01")];
  publishedOnly(input);
  expect(input.map((p) => p.id)).toEqual(["old", "new"]);
});

test("handles an empty list", () => {
  expect(publishedOnly([])).toEqual([]);
});
