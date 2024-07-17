import { test, describe } from "~/test/context";

describe("hi", () => {
  test("it should be done", ({ conn }) => {
    conn;
    console.log("user.repository.test");
  });
});
