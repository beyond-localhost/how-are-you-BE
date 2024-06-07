import {
  createExternalIdentities,
  createSession,
  createUser,
  findExternalIdentityWithUserById,
} from "src/domain/user.repository";
import { fetchKakaoToken, fetchKakaoUser } from "src/lib/kakao";
import { deserializeOAuthState, serializeOAuthState } from "src/lib/oauth";
import { validateURL } from "src/lib/url";
import { createRoute, honoApp, z } from "src/runtime/hono";

import { setSignedCookie } from "hono/cookie";

const auth = honoApp();

auth.openapi(
  createRoute({
    tags: ["Auth"],
    method: "post",
    path: "/auth/kakao",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              destination: z.string(),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "카카오 로그인 URL을 반환합니다",
        content: {
          "application/json": {
            schema: z.object({
              url: z.string(),
            }),
          },
        },
      },
      400: {
        description: "잘못된 URL을 전달하였을 때 반환되는 값이에요",
        content: {
          "application/json": {
            schema: z.object({
              code: z.literal(400),
              error: z.string(),
            }),
          },
        },
      },
    },
  }),
  (c) => {
    const { destination } = c.req.valid("json");
    const brandedDestination = validateURL(destination);
    let state: string;

    try {
      state = serializeOAuthState("kakao", brandedDestination);
    } catch (e) {
      console.error(e);
      return c.json({ code: 400 as const, error: "잘못된 URL을 입력하였습니다" }, 400);
    }

    const redirectUri = `${c.var.env.Server.Host}:${c.var.env.Server.Port}/callback`;
    const KAKAO_AUTH_HOST = "https://kauth.kakao.com/oauth/authorize";
    const kakaoURL = new URL(KAKAO_AUTH_HOST);
    kakaoURL.searchParams.set("redirect_uri", redirectUri);
    kakaoURL.searchParams.set("response_type", "code");
    kakaoURL.searchParams.set("client_id", c.var.env.Credential.KakaoRestAPIKey);
    kakaoURL.searchParams.set("state", state);
    return c.json({ url: kakaoURL }, 201);
  },
);
auth.openapi(
  createRoute({
    tags: ["Auth"],
    method: "get",
    deprecated: true,
    description: "This is only used for internal oauth process. Do not use this.",
    path: "/callback",
    request: {
      query: z.object({
        code: z.string(),
        state: z.string(),
      }),
    },
    responses: {
      302: {
        description: "로그인 성공",
      },
      400: {
        description: "잘못된 요청",
        content: {
          "application/json": {
            schema: z.object({
              code: z.literal(400),
              error: z.string(),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    const { code, state } = c.req.valid("query");
    const deserializedStateResult = deserializeOAuthState(state);
    const env = c.var.env;
    const conn = c.var.conn;

    const redirectUri = `${env.Server.Host}:${env.Server.Port}/callback`;
    const clientId = env.Credential.KakaoRestAPIKey;
    const clientSecret = env.Credential.KakaoSecret;
    const tokenResponse = await fetchKakaoToken({
      clientId,
      clientSecret,
      code,
      redirectUri,
    });
    const userResponse = await fetchKakaoUser(tokenResponse.access_token);
    const session = await conn.transaction(async (tx) => {
      let externalIdentityWithUser = await findExternalIdentityWithUserById(conn, userResponse.id.toString());
      const user =
        externalIdentityWithUser?.users || (await createUser(tx, { email: userResponse.kakao_account.email }));

      if (!externalIdentityWithUser) {
        await createExternalIdentities(tx, {
          id: userResponse.id.toString(),
          provider: "kakao",
          email: userResponse.kakao_account.email,
          userId: user.id,
        });
      }
      return createSession(tx, {
        userId: user.id,
      });
    });

    const destinationURL = new URL(deserializedStateResult.destination);
    const maxAge = destinationURL.searchParams.get("autoLogin") === "T" ? 60 * 60 * 24 * 30 : undefined;

    await setSignedCookie(c, "sid", session.id.toString(), env.Credential.JWTSecret, {
      httpOnly: true,
      sameSite: "strict",
      maxAge,
    });
    return c.redirect(destinationURL.toString(), 302);
  },
);

export default auth;
