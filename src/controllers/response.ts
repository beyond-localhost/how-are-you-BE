import { type UnAuthorizedResponseConfig, z } from "src/runtime/hono";

export const unAuthorizedResponse = {
  description: "세션 값이 없거나 / 유효하지 않은 경우에 해당합니다. 이경우 첨부된 쿠키도 전부 지워집니다!",
  content: {
    "application/json": {
      schema: z.object({
        code: z.literal(401),
        error: z.string(),
      }),
    },
  },
} satisfies UnAuthorizedResponseConfig;
