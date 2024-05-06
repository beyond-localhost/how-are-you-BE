import { DataParseError, InputRangeError, JSONParseError } from "../core/error";
import { z } from "zod";

const OAuthState = z.object({
  provider: z.enum(["kakao"]),
  destination: z.string(),
});
type OAuthState = z.infer<typeof OAuthState>;

export const serializeOAuthState = (state: OAuthState) => {
  const trimmedDestination = state.destination.trim();

  if (trimmedDestination.length === 0) {
    return new InputRangeError(
      "[serializeOAuthState] trimmed destination must be at least 1 characters"
    );
  }

  const validationResult = OAuthState.safeParse({
    provider: state.provider,
    destination: trimmedDestination,
  });
  if (validationResult.success === false) {
    return new DataParseError(
      "[serializeOAuthState] payload should be valid format"
    );
  }
  return Buffer.from(JSON.stringify(validationResult.data)).toString("base64");
};

export const deserializeOAuthState = (state: string) => {
  const trimmedState = state.trim();

  if (trimmedState.length === 0) {
    return new InputRangeError(
      "[deSerializeOAuthState] trimmed state must be at least 1 characters"
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(Buffer.from(trimmedState, "base64").toString());
  } catch (e) {
    return new JSONParseError(e?.toString() || "");
  }

  const result = OAuthState.safeParse(json);
  if (!result.success) {
    return new DataParseError(
      "[deSerializeOAuthState] payload should be valid format"
    );
  }
  return result.data;
};
