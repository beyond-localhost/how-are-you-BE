import { z } from "zod";
import type { LooselyValidURL } from "./url";

const OAuthState = z.object({
  provider: z.enum(["kakao"]),
  destination: z.string(),
});

type OAuthState = z.infer<typeof OAuthState>;

export const serializeOAuthState = (provider: OAuthState["provider"], destination: LooselyValidURL) => {
  const validationResult = OAuthState.safeParse({
    provider: provider,
    destination: destination,
  });
  if (!validationResult.success) {
    throw new Error("OAuthState validation failed", {
      cause: validationResult.error.errors,
    });
  }
  return Buffer.from(JSON.stringify(validationResult.data)).toString("base64");
};

export const deserializeOAuthState = (state: string) => {
  const trimmedState = state.trim();

  if (trimmedState.length === 0) {
    throw new Error("The oauthState must be type of base64 string");
  }

  const json = JSON.parse(Buffer.from(trimmedState, "base64").toString());

  const result = OAuthState.safeParse(json);
  if (!result.success) {
    throw new Error(`Failed to parse OAuthState: ${result.error.errors}`);
  }
  return result.data;
};
