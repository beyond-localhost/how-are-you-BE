import { describe, test, expect, expectTypeOf } from "vitest";
import { safeAsyncRun } from "./async";

describe("safeAsyncRun", () => {
  test("It should return resolved value if async function successfully run", async () => {
    const makeSuccessfulPromise = () => Promise.resolve(3 as const);
    const ret = await safeAsyncRun(makeSuccessfulPromise);
    expect(ret).toBe(3);
  });

  test("It should return false if async function return rejected promise", async () => {
    const makeUnsuccessfulPromise = () => {
      return new Promise<number>((_, rej) => {
        rej();
      });
    };
    const ret = await safeAsyncRun(makeUnsuccessfulPromise);
    expect(ret).toBe(false);
  });

  test("The return type is either resolved value or false", async () => {
    function returnBoolean(): Promise<boolean> {
      return Promise.reject();
    }
    expectTypeOf(await safeAsyncRun(returnBoolean)).toEqualTypeOf<boolean>();
  });
});
