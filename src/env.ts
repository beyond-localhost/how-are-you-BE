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
  Port: z.union([z.string(), z.number()]).transform(Number),
});

const Database = z.object({
  host: z.string(),
  port: z.union([z.string(), z.number()]).transform(Number),
  user: z.string(),
  password: z.string(),
  database: z.string(),
});
const App = z.object({
  appEnv: z.union([z.literal("development"), z.literal("production"), z.literal("test")]),
});
//regionend

const Env = z.object({ Credential, Server, Database, App });
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
    App: {
      appEnv: process.env.APP_ENV,
    },
  });
}

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export function resolveTestENV(overrides?: DeepPartial<Env>): Env {
  return Env.parse({
    Credential: {
      KakaoRestAPIKey: "test",
      KakaoSecret: "test",
      JWTIssuer: "test",
      JWTSecret: "test",
      ...overrides?.Credential,
    },
    Server: {
      Host: "http://localhost",
      Port: "7777",
      ...overrides?.Server,
    },
    Database: {
      host: "localhost",
      port: "3306",
      user: "root",
      password: "root",
      database: "",
      ...overrides?.Database,
    },
    App: {
      appEnv: "test",
    },
  });
}
