import { describe, test, expectTypeOf } from "vitest";
import { assertURL, type LooselyValidURL } from "./url";
import fc from "fast-check";

describe("assertURL", () => {
  test("The argument(string) should be LooselyValidURL If assertURL does not throw an error", () => {
    fc.assert(
      fc.property(fc.webUrl(), (url) => {
        assertURL(url);
        expectTypeOf(url).toMatchTypeOf<LooselyValidURL>();
      }),
    );
  });
});
