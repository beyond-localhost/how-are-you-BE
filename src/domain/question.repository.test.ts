import { test, describe } from "~/test/context";

describe("hi", () => {
  test("it should be done", ({ env, conn, client }) => {
    console.log("question.repository.test");
  });
});
