import { z } from "zod";

import { DataParseError, FetchNotOkError } from "../core/error";

const KakaoTokenResponse = z.object({
  access_token: z.string(),
  token_type: z.literal("bearer"),
});
type KakaoTokenResponse = z.infer<typeof KakaoTokenResponse>;

const KakaoUserResponse = z.object({
  id: z.number(),
  properties: z.object({
    nickname: z.string(),
  }),
  kakao_account: z.object({
    email: z.string().email(),
  }),
});
type KakaoUserResponse = z.infer<typeof KakaoUserResponse>;

type FetchKakaoTokenOptions = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
};
// export async function fetchKakaoToken(options: FetchKakaoTokenOptions): Promis {}

export const fetchKakaoToken = async (
  options: FetchKakaoTokenOptions
): Promise<KakaoTokenResponse | FetchNotOkError | DataParseError> => {
  const KAKAO_TOKEN_HOST = "https://kauth.kakao.com/oauth/token";
  const KAKAO_CONTENT_TYPE = "application/x-www-form-urlencoded";
  const KAKAO_GRANT_TYPE = "authorization_code";
  // TODO-START: remove duplicated variables
  const redirectUri = options.redirectUri;
  // TODO-END: remove duplicated variables

  const clientId = options.clientId;
  const clientSecret = options.clientSecret;

  const requestHeader = new Headers();
  requestHeader.set("Content-type", KAKAO_CONTENT_TYPE);

  const urlSearchParams = new URLSearchParams();
  urlSearchParams.append("grant_type", KAKAO_GRANT_TYPE);
  urlSearchParams.append("client_id", clientId);
  urlSearchParams.append("client_secret", clientSecret);
  urlSearchParams.append("redirect_uri", redirectUri);
  urlSearchParams.append("code", options.code);

  const tokenResponse = await fetch(KAKAO_TOKEN_HOST, {
    headers: requestHeader,
    method: "POST",
    body: urlSearchParams.toString(),
  });

  if (!tokenResponse.ok) {
    return new FetchNotOkError("Kakao Token Request failed");
  }

  const parseResult = KakaoTokenResponse.safeParse(await tokenResponse.json());
  if (!parseResult.success) {
    return new DataParseError("Kakao token data parsing failed");
  }
  return parseResult.data;
};

export const fetchKakaoUser = async (
  accessToken: string
): Promise<KakaoUserResponse | FetchNotOkError | DataParseError> => {
  const KAKAO_USER_HOST = "https://kapi.kakao.com/v2/user/me";
  const requestHeader = new Headers();
  requestHeader.set("authorization", `Bearer ${accessToken}`);

  const userResponse = await fetch(KAKAO_USER_HOST, {
    headers: requestHeader,
    method: "GET",
  });

  if (!userResponse.ok) {
    return new FetchNotOkError("Kakao user request failed");
  }

  const parseResult = KakaoUserResponse.safeParse(await userResponse.json());
  if (!parseResult.success) {
    return new DataParseError("Kakao user data parsing failed");
  }
  return parseResult.data;
};
