import { t } from "elysia";
const ErrorTag = {
  FetchNotOkError: "FetchNotOkError",
  DataParseError: "DataParseError",
  DataNotFoundError: "DataNotFoundError",
  InputRangeError: "InputRangeError",
  JSONParseError: "JSONParseError",
  JWTExpiredError: "JWTExpiredError",
  JWTMalformedError: "JWTMalformedError",
} as const;
export const ErrorTagValues = Object.keys(ErrorTag);

interface CoreError {
  _tag: keyof typeof ErrorTag;
}

const createErrorValidation = <TTag extends keyof typeof ErrorTag>(tag: TTag) =>
  t.Object({ _tag: t.Literal(tag) });

export const fetchNotOkError = () =>
  ({ _tag: ErrorTag.FetchNotOkError } as const);
export type FetchNotOkError = ReturnType<typeof fetchNotOkError>;
export const FetchNotOkError = createErrorValidation("FetchNotOkError");

export const dataParseError = () =>
  ({ _tag: ErrorTag.DataParseError } as const);
export type DataParseError = ReturnType<typeof dataParseError>;
export const DataParseError = createErrorValidation("DataParseError");

export const dataNotFoundError = () =>
  ({ _tag: ErrorTag.DataNotFoundError } as const);
export type DataNotFoundError = ReturnType<typeof dataNotFoundError>;
export const DataNotFoundError = createErrorValidation("DataNotFoundError");

export const inputRangeError = () =>
  ({ _tag: ErrorTag.InputRangeError } as const);
export type InputRangeError = ReturnType<typeof inputRangeError>;
export const InputRangeError = createErrorValidation("InputRangeError");

export const jsonParseError = () =>
  ({ _tag: ErrorTag.JSONParseError } as const);
export type JsonParseError = ReturnType<typeof jsonParseError>;
export const JsonParseError = createErrorValidation("JSONParseError");

export const jwtExpiredError = () =>
  ({ _tag: ErrorTag.JWTExpiredError } as const);
export type JWTExpiredError = ReturnType<typeof jwtExpiredError>;
export const JWTExpiredError = createErrorValidation("JWTExpiredError");

export const jwtMalformedError = () =>
  ({ _tag: ErrorTag.JWTMalformedError } as const);
export type JWTMalformedError = ReturnType<typeof jwtMalformedError>;
export const JWTMalformedError = createErrorValidation("JWTMalformedError");

export const isError = (value: unknown): value is CoreError =>
  typeof value === "object" &&
  value !== null &&
  "_tag" in value &&
  typeof value["_tag"] === "string" &&
  ErrorTagValues.includes(value["_tag"]);
