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
//regionend

const Env = z.object({ Credential, Server });
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
  });
}
