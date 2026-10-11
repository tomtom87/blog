import { expect, test } from "vitest";
import { formatDate } from "./date";

test("formats as 'Oct 11, 2026' regardless of local timezone", () => {
  expect(formatDate(new Date("2026-10-11"))).toBe("Oct 11, 2026");
});
