import { convertDateToDateTime, makeDateTime, type DateTime } from "./date";
import { describe, test, expect, expectTypeOf } from "vitest";
import fc from "fast-check";

describe("convertDateToDateTime", () => {
  test("It should return DateTime if the argument is valid date", () => {
    fc.assert(
      fc.property(fc.date({ noInvalidDate: true }), (d) => {
        // convertDateToDateTime throws an error if the date is invalid.
        expectTypeOf(convertDateToDateTime(d)).toMatchTypeOf<DateTime>();
      }),
    );
  });

  test("It should throws an error if the argument is invalid date", () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const d = new Date(s);
        // the return type fc.date() is always invalid, because I pass any random 'string' arguments and convert it to the date
        // In this case, we catch the error and expect the error to have a message: Assertion Failed
        try {
          convertDateToDateTime(d);
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
        }
      }),
    );
  });
});

describe("makeDateTime", () => {
  test("It should return valid DateTime type if the arguments combine valid date", () => {
    fc.assert(
      fc.property(fc.date({ noInvalidDate: true }), (d) => {
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const dd = d.getDate();
        // makeDateTime asserts If the combinated number can make the Date object
        // If it can't, It throws an error which is same as convertDateToDateTime
        expectTypeOf(makeDateTime(y, m, dd)).toMatchTypeOf<DateTime>();
      }),
    );
  });

  test("It should throws an error if the arguments can't make the valid date", () => {
    fc.assert(
      // Assume year is always valid and month/day is invalid
      fc.property(fc.integer({ min: 2020, max: 2024 }), fc.integer({ min: 13 }), fc.integer({ min: 33 }), (y, m, d) => {
        expect(() => makeDateTime(y, m, d)).toThrowError(Error);
      }),
    );
  });
});
