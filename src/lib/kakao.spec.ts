/**
 * I think this tests are considered useless, because I don't know any kind of implmenetations of auth logic in the kakao.
 * However, for integration/e2e tests, each funciton of codes kakao.ts is bridge to client and persistent layer.
 */
import { describe, test, expectTypeOf, beforeAll, afterAll, expect } from "vitest";
import { KakaoTokenResponse, KakaoUserResponse, fetchKakaoToken, fetchKakaoUser } from "./kakao";
import { createKakaoStub, TEST_AUTHORIZATION_CODE, TEST_CLIENT_ID, TEST_CLIENT_SECRET } from "~/test/stubs/kakao";

const kakaoServer = createKakaoStub();

beforeAll(() => {
  kakaoServer.listen();
});
afterAll(() => {
  kakaoServer.close();
});

describe("fetchKakaoToken", () => {
  test("It should throw an error if the one of clientId, clientSecret, redirectUri, and authorization code is invalid", async () => {
    await expect(() =>
      fetchKakaoToken({
        clientId: "",
        clientSecret: "",
        code: TEST_AUTHORIZATION_CODE,
        redirectUri: "hello world",
      }),
    ).rejects.toThrowError(`Failed to parse Kakao token`);
  });

  test("It should throw an error if all the properties are valid", async () => {
    const ret = await fetchKakaoToken({
      clientId: TEST_CLIENT_ID,
      clientSecret: TEST_CLIENT_SECRET,
      code: TEST_AUTHORIZATION_CODE,
      redirectUri: "https://example.com",
    });

    expectTypeOf(ret).toMatchTypeOf<KakaoTokenResponse>();
  });
});

describe("fetchKakaoUser", () => {
  test("It should throw an error if access token is invalid", async () => {
    await expect(() => fetchKakaoUser("")).rejects.toThrowError(`Failed to parse Kakao user`);
  });

  test("It should returns an error if access token is valid", async () => {
    const token = await fetchKakaoToken({
      clientId: TEST_CLIENT_ID,
      clientSecret: TEST_CLIENT_SECRET,
      code: TEST_AUTHORIZATION_CODE,
      redirectUri: "https://example.com",
    });
    const user = await fetchKakaoUser(token.access_token);
    expectTypeOf(user).toMatchTypeOf<KakaoUserResponse>();
  });
});
