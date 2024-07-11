import { z } from "zod";

//region schema
const Credential = z.object({
  KakaoRestAPIKey: z.string(),
  KakaoSecret: z.string(),
  JWTIssuer: z.string(),
  JWTSecret: z.string(),
});

const Server = z.object({
  Host: z.string(),
  Port: z.string().transform(Number),
});

const Database = z.object({
  host: z.string(),
  port: z.string().transform(Number),
  user: z.string(),
  password: z.string(),
  database: z.string(),
});
//regionend

const Env = z.object({ Credential, Server, Database });
export type Env = z.infer<typeof Env>;

export function resolveEnv(): Env {
  return Env.parse({
    Credential: {
      KakaoRestAPIKey: Bun.env.KAKAO_REST_API_KEY,
      KakaoSecret: Bun.env.KAKAO_SECRET,
      JWTIssuer: Bun.env.JWT_ISSUER,
      JWTSecret: Bun.env.JWT_SECRET,
    },
    Server: {
      Host: Bun.env.SERVER_HOST,
      Port: Bun.env.SERVER_PORT,
    },
    Database: {
      host: Bun.env.DB_HOST,
      port: Bun.env.DB_PORT,
      user: Bun.env.DB_USER,
      password: Bun.env.DB_PASSWORD,
      database: Bun.env.DB_DATABASE_NAME,
    },
  });
}
