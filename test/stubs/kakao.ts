import { KakaoTokenResponse, KakaoUserResponse, KakaoHost } from "~/lib/kakao";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

let globalUserId = 1;

export const TEST_AUTHORIZATION_CODE = "test";
export const TEST_CLIENT_ID = "test";
export const TEST_CLIENT_SECRET = "test";
const tokenSet = new Set<string>();

const fetchKakaoToken = http.post(KakaoHost.Token, async ({ request }) => {
  const { headers } = request;

  const contentType = headers.get("Content-type");
  if (contentType !== "application/x-www-form-urlencoded") {
    return HttpResponse.json({ status: 400 });
  }
  const formData = await request.formData();

  /**
   * Validate all required fields except client_id and client_secret
   */
  const grantType = formData.get("grant_type");

  if (grantType !== "authorization_code") {
    return HttpResponse.json({ status: 400 });
  }

  const redirectUri = formData.get("redirect_uri");
  if (redirectUri === null || redirectUri instanceof File || !URL.canParse(redirectUri.toString())) {
    return HttpResponse.json({ status: 400 });
  }

  const clientId = formData.get("client_id");
  const clientSecret = formData.get("client_secret");

  if (clientId !== TEST_CLIENT_ID || clientSecret !== TEST_CLIENT_SECRET) {
    return HttpResponse.json({ status: 400 });
  }

  const authorizationCode = formData.get("code");
  if (authorizationCode !== TEST_AUTHORIZATION_CODE) {
    return HttpResponse.json({ status: 400 });
  }

  const stringifiedId = globalUserId.toString();
  const ret: KakaoTokenResponse = {
    token_type: "bearer",
    access_token: stringifiedId,
  };
  tokenSet.add(stringifiedId);
  globalUserId++;
  return HttpResponse.json(ret, { status: 200 });
});

const fetchKakaoUser = http.get(KakaoHost.User, ({ request }) => {
  const { headers } = request;
  const token = headers.get("authorization")?.slice(7) || "";
  if (!token || !tokenSet.has(token)) {
    return HttpResponse.json({ status: 401 });
  }
  const userId = Number(token);
  if (Number.isNaN(userId)) {
    return HttpResponse.json({ status: 401 });
  }

  const ret: KakaoUserResponse = {
    id: userId,
    kakao_account: {
      email: `test${userId}@test.com`,
    },
    properties: {
      nickname: `user${userId}`,
    },
  };
  return HttpResponse.json(ret, { status: 200 });
});

const handlers = [fetchKakaoToken, fetchKakaoUser];

export const createKakaoStub = () => setupServer(...handlers);
