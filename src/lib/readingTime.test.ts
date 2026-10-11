import { expect, test } from "vitest";
import { readingTime } from "./readingTime";

const words = (n: number) => Array(n).fill("word").join(" ");

test("empty text is 1 minute", () => {
  expect(readingTime("")).toBe(1);
});

test("200 words is 1 minute", () => {
  expect(readingTime(words(200))).toBe(1);
});

test("201 words rounds up to 2 minutes", () => {
  expect(readingTime(words(201))).toBe(2);
});

test("1000 words is 5 minutes", () => {
  expect(readingTime(words(1000))).toBe(5);
});

test("extra whitespace is ignored", () => {
  expect(
    readingTime(`  \n\n ${words(200).replaceAll(" ", " \n\t ")}  \n`),
  ).toBe(1);
});
