import { describe, expect, test } from "vitest";
import { head, nonNullish } from "./predicate";

describe("head", () => {
  test("It returns a value if the array is not empty", () => {
    expect(head([0])).toBe(0);
    expect(head([""])).toBe("");
    expect(head([{}])).toEqual({});
    expect(head([undefined])).toBe(undefined);
    expect(head([null])).toBe(null);
  });
  test("It should throw an error if the array is empty", () => {
    expect(() => head([])).toThrowError(Error);
  });
});

describe("nonNullish", () => {
  test("It returns a value if value is non-nullish", () => {
    ["", 0, true, false, -0, NaN].forEach((falsy) => {
      expect(nonNullish(falsy)).toEqual(falsy);
    });
  });
  test("It throws an error if value is nullish(either null or undefined)", () => {
    [null, undefined].forEach((nullish) => {
      expect(() => nonNullish(nullish)).toThrowError(Error);
    });
  });
});
