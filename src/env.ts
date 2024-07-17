import "dotenv/config";
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
      KakaoRestAPIKey: process.env.KAKAO_REST_API_KEY,
      KakaoSecret: process.env.KAKAO_SECRET,
      JWTIssuer: process.env.JWT_ISSUER,
      JWTSecret: process.env.JWT_SECRET,
    },
    Server: {
      Host: process.env.SERVER_HOST,
      Port: process.env.SERVER_PORT,
    },
    Database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE_NAME,
    },
  });
}
