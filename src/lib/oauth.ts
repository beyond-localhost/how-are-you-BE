import { inputRangeError, dataParseError, jsonParseError } from "../core/error";
import { z } from "zod";
import type { LooselyValidURL } from "./url";

const OAuthState = z.object({
  provider: z.enum(["kakao"]),
  destination: z.string(),
});

type OAuthState = z.infer<typeof OAuthState>;

export const serializeOAuthState = (
  provider: OAuthState["provider"],
  destination: LooselyValidURL
) => {
  const validationResult = OAuthState.safeParse({
    provider: provider,
    destination: destination,
  });
  if (validationResult.success === false) {
    throw new Error("OAuthState validation failed", {
      cause: validationResult.error.errors,
    });
  }
  return Buffer.from(JSON.stringify(validationResult.data)).toString("base64");
};

export const deserializeOAuthState = (state: string) => {
  const trimmedState = state.trim();

  if (trimmedState.length === 0) {
    return inputRangeError();
  }

  let json: unknown;
  try {
    json = JSON.parse(Buffer.from(trimmedState, "base64").toString());
  } catch (e) {
    return jsonParseError();
  }

  const result = OAuthState.safeParse(json);
  if (!result.success) {
    return dataParseError();
  }
  return result.data;
};
