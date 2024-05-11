import { Elysia, t } from "elysia";
import { resolveEnv } from "./env";
import { createSQLiteDatabase } from "./domain/rdb";
import { fetchKakaoToken, fetchKakaoUser } from "./lib/kakao";
import {
  DataNotFoundError,
  DataParseError,
  FetchNotOkError,
} from "./core/error";
import {
  createUser,
  findUserByExternalId,
  findUserById,
} from "./domain/user.repository";
import jwt from "@elysiajs/jwt";
import { deserializeOAuthState, serializeOAuthState } from "./lib/oauth";
import swagger from "@elysiajs/swagger";

const env = resolveEnv();
const db = createSQLiteDatabase();

const app = new Elysia()
  .decorate("version", "1.0.0")
  .decorate("env", env)
  .decorate("conn", db)
  .get("/version", ({ version }) => version)
  .use(
    swagger({
      exclude: "/callback",
      documentation: {
        info: {
          title: "How are you - API",
          version: "1.0.0",
        },
        tags: [
          {
            name: "Auth",
            description: "How Are You 서비스의 auth를 나타내요",
          },
        ],
      },
    })
  )
  .use(
    jwt({
      name: "jwt",
      secret: env.Credential.JWTSecret,
      iss: env.Credential.JWTIssuer,
    })
  )
  .post(
    "/auth/kakao",
    ({ env, body: { destination }, set }) => {
      const state = serializeOAuthState({ destination, provider: "kakao" });

      if (typeof state !== "string") {
        set.status = 400;
        return "";
      }

      const redirectUri = `${env.Server.Host}:${env.Server.Port}/callback`;
      const KAKAO_AUTH_HOST = "https://kauth.kakao.com/oauth/authorize";
      const kakaoURL = new URL(KAKAO_AUTH_HOST);
      kakaoURL.searchParams.set("redirect_uri", redirectUri);
      kakaoURL.searchParams.set("response_type", "code");
      kakaoURL.searchParams.set("client_id", env.Credential.KakaoRestAPIKey);
      kakaoURL.searchParams.set("state", state);
      return kakaoURL.toString();
    },
    {
      body: t.Object({
        destination: t.String(),
      }),
      response: t.String(),
      detail: {
        tags: ["Auth"],
      },
    }
  )
  .get(
    "/callback",
    async ({ env, query: { code, state }, set, conn, jwt, redirect }) => {
      const oauthState = deserializeOAuthState(state);
      if ("_tag" in oauthState) {
        set.status = 400;
        return null;
      }

      // TODO-START: remove duplicated variables
      const redirectUri = `${env.Server.Host}:${env.Server.Port}/callback`;
      // TODO-END: remove duplicated variables

      const clientId = env.Credential.KakaoRestAPIKey;
      const clientSecret = env.Credential.KakaoSecret;
      const tokenResponse = await fetchKakaoToken({
        clientId,
        clientSecret,
        code,
        redirectUri,
      });

      if (
        tokenResponse instanceof DataParseError ||
        tokenResponse instanceof FetchNotOkError
      ) {
        set.status = 400;
        return null;
      }

      const userResponse = await fetchKakaoUser(tokenResponse.access_token);

      if (
        userResponse instanceof DataParseError ||
        userResponse instanceof FetchNotOkError
      ) {
        set.status = 400;
        return null;
      }

      const tokenInfo = await conn.transaction(async (tx) => {
        let user = await findUserByExternalId(tx, `${userResponse.id}`);
        console.log(user);
        if (user instanceof DataNotFoundError) {
          user = await createUser(tx, {
            externalId: userResponse.id.toString(),
            email: userResponse.kakao_account.email,
            userName: userResponse.properties.nickname,
          });
        }
        const sub = user.id;

        const iat = Math.round(Date.now() / 1_000);
        const accessTokenExp = iat + 3_600;
        const refreshTokenExp = iat + 86_400 * 7;
        const accessToken = await jwt.sign({
          iat,
          exp: accessTokenExp,
          sub: sub.toString(),
        });
        const refreshToken = await jwt.sign({
          iat,
          exp: refreshTokenExp,
          sub: sub.toString(),
        });
        return { accessToken, refreshToken };
      });

      const destinationURL = new URL(oauthState.destination);
      destinationURL.searchParams.set("access_token", tokenInfo.accessToken);
      destinationURL.searchParams.set("refresh_token", tokenInfo.refreshToken);
      return redirect(destinationURL.toString());
    },
    { query: t.Object({ code: t.String(), state: t.String() }) }
  )
  .guard(
    {
      headers: t.Object({
        authorization: t.TemplateLiteral("Bearer ${string}"),
      }),
    },
    (app) =>
      app
        .resolve(async ({ headers: { authorization }, jwt }) => {
          const bearerToken = authorization.split(" ")[1];
          if (bearerToken === undefined || bearerToken.length === 0) {
            throw new Error("Bearer token should be defined");
          }
          const jwtPayload = await jwt.verify(bearerToken);
          if (jwtPayload === false) {
            throw new Error("JWT should be defined");
          }
          const userId = jwtPayload.sub;
          if (!userId || Number.isNaN(Number(userId))) {
            throw new Error("userId not defined");
          }

          return {
            userId: Number(userId),
          };
        })
        .get("/sessions", async ({ userId, conn, set }) => {
          const user = await findUserById(conn, userId);
          if (user instanceof DataNotFoundError) {
            set.status = 404;
            return;
          }
          return user;
        })
  )
  .listen(env.Server.Port);

export type App = typeof app;
