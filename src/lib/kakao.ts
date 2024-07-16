import { z } from "zod";

export const KakaoTokenResponse = z.object({
  access_token: z.string(),
  token_type: z.literal("bearer"),
});
export type KakaoTokenResponse = z.infer<typeof KakaoTokenResponse>;

export const KakaoUserResponse = z.object({
  id: z.number(),
  properties: z.object({
    nickname: z.string(),
  }),
  kakao_account: z.object({
    email: z.string().email(),
  }),
});
export type KakaoUserResponse = z.infer<typeof KakaoUserResponse>;

export type FetchKakaoTokenOptions = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
};

export const KakaoHost = {
  Authorize: "https://kauth.kakao.com/oauth/authorize",
  Token: "https://kauth.kakao.com/oauth/token",
  User: "https://kapi.kakao.com/v2/user/me",
} as const;

export const fetchKakaoToken = async (options: FetchKakaoTokenOptions): Promise<KakaoTokenResponse> => {
  const KAKAO_CONTENT_TYPE = "application/x-www-form-urlencoded";
  const KAKAO_GRANT_TYPE = "authorization_code";
  const redirectUri = options.redirectUri;
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

  const tokenResponse = await fetch(KakaoHost.Token, {
    headers: requestHeader,
    method: "POST",
    body: urlSearchParams.toString(),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Failed to fetch Kakao token: ${tokenResponse.statusText}`);
  }

  const parseResult = KakaoTokenResponse.safeParse(await tokenResponse.json());
  if (!parseResult.success) {
    throw new Error(`Failed to parse Kakao token: ${parseResult.error.errors}`);
  }
  return parseResult.data;
};

export const fetchKakaoUser = async (accessToken: string): Promise<KakaoUserResponse> => {
  const requestHeader = new Headers();
  requestHeader.set("authorization", `Bearer ${accessToken}`);

  const userResponse = await fetch(KakaoHost.User, {
    headers: requestHeader,
    method: "GET",
  });

  if (!userResponse.ok) {
    throw new Error(`Failed to fetch Kakao user: ${userResponse.statusText}`);
  }

  const parseResult = KakaoUserResponse.safeParse(await userResponse.json());
  if (!parseResult.success) {
    throw new Error(`Failed to parse Kakao user: ${parseResult.error.errors}`);
  }
  return parseResult.data;
};
