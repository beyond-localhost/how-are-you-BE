import { Elysia, t } from "elysia";
import { resolveEnv } from "./env";
import { createSQLiteDatabase } from "./domain/rdb";
import { fetchKakaoToken, fetchKakaoUser } from "./lib/kakao";
import {
  DataNotFoundError,
  DataParseError,
  FetchNotOkError,
} from "./core/error";
import { createUser, findUserByExternalId } from "./domain/user.repository";
import jwt from "@elysiajs/jwt";

async function bootstrap() {
  const env = resolveEnv();
  const db = createSQLiteDatabase();

  new Elysia()
    .decorate("version", "1.0.0")
    .decorate("env", env)
    .decorate("conn", db)
    .get("/version", ({ version }) => version)
    .use(
      jwt({
        name: "jwt",
        secret: env.Credential.JWTSecret,
        iss: env.Credential.JWTIssuer,
      })
    )
    .get("/auth/kakao", ({ env }) => {
      const redirectUri = `${env.Server.Host}:${env.Server.Port}/callback`;
      const KAKAO_AUTH_HOST = "https://kauth.kakao.com/oauth/authorize";
      const kakaoURL = new URL(KAKAO_AUTH_HOST);
      kakaoURL.searchParams.set("redirect_uri", redirectUri);
      kakaoURL.searchParams.set("response_type", "code");
      kakaoURL.searchParams.set("client_id", env.Credential.KakaoRestAPIKey);
      return kakaoURL.toString();
    })
    .get(
      "/callback",
      async ({ env, query: { code }, set, conn, jwt }) => {
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

        return conn.transaction(async (tx) => {
          let user = await findUserByExternalId(tx, `${userResponse.id}`);
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
          console.log(accessToken);
          console.log(refreshToken);
          return { accessToken, refreshToken };
        });
      },
      { query: t.Object({ code: t.String() }) }
    )
    .get("/user/:id", ({ params: { id } }) => id)
    .post("/form", ({ body }) => body)
    .listen(env.Server.Port);
}

bootstrap().catch(console.error);
