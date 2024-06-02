import { t } from "elysia";
const ErrorTag = {
  FetchNotOkError: "FetchNotOkError",
  DataParseError: "DataParseError",
  DataNotFoundError: "DataNotFoundError",
  InputRangeError: "InputRangeError",
  JSONParseError: "JSONParseError",
  InvalidSessionError: "InvalidSessionError",
  UnInterntionalError: "UnInterntionalError",
  UserAlreadyAnswerTodayQuestionError: "UserAlreadyAnswerTodayQuestionError",
  UserNotAnswerQuestionError: "UserNotAnswerQuestionError",
  QuestionAnswerModificationTimeLimitError:
    "QuestionAnswerModificationTimeLimitError",

  //
  VerificationCodeNotExistedError: "VerificationCodeNotExistedError",
  VerificationCodeNotMatchedError: "VerificationCodeNotMatchedError",
  /**
   * Not implemented yet
   * VerificationCodeExpiredError = "VerificaitonCodeExpiredError"
   */
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

export const invalidSessionError = () =>
  ({ _tag: ErrorTag.InvalidSessionError } as const);
export type InvalidSessionError = ReturnType<typeof invalidSessionError>;
export const InvalidSessionError = createErrorValidation("InvalidSessionError");

export const userAlreadyAnswerTodayQuestionError = () =>
  ({ _tag: ErrorTag.UserAlreadyAnswerTodayQuestionError } as const);
export type UserAlreadyAnswerTodayQuestionError = ReturnType<
  typeof userAlreadyAnswerTodayQuestionError
>;
export const UserAlreadyAnswerTodayQuestionError = createErrorValidation(
  "UserAlreadyAnswerTodayQuestionError"
);

export const userNotAnswerQuestionError = () =>
  ({ _tag: ErrorTag.UserNotAnswerQuestionError } as const);
export type UserNotAnswerQuestionError = ReturnType<
  typeof userNotAnswerQuestionError
>;
export const UserNotAnswerQuestionError = createErrorValidation(
  "UserNotAnswerQuestionError"
);

export const verificationCodeNotExistedError = () =>
  ({ _tag: "VerificationCodeNotExistedError" } as const);
export type VerificationCodeNotExistedError = ReturnType<
  typeof verificationCodeNotExistedError
>;
export const VerificationCodeNotExistedError = createErrorValidation(
  "VerificationCodeNotExistedError"
);

export const verificationCodeNotMatchedError = () =>
  ({ _tag: "VerificationCodeNotMatchedError" } as const);
export type VerificationCodeNotMatchedError = ReturnType<
  typeof verificationCodeNotMatchedError
>;
export const VerificationCodeNotMatchedError = createErrorValidation(
  "VerificationCodeNotMatchedError"
);

export const unIntentionalError = () =>
  ({ _tag: ErrorTag.UnInterntionalError } as const);
export type UnIntentionalError = ReturnType<typeof unIntentionalError>;
export const UnIntentionalError = createErrorValidation("UnInterntionalError");

export const questionAnswerModificationTimeLimitError = () =>
  ({ _tag: ErrorTag.QuestionAnswerModificationTimeLimitError } as const);
export type QuestionAnswerModificationTimeLimitError = ReturnType<
  typeof questionAnswerModificationTimeLimitError
>;
export const QuestionAnswerModificationTimeLimitError = createErrorValidation(
  "QuestionAnswerModificationTimeLimitError"
);

export const isError = (value: unknown): value is CoreError =>
  typeof value === "object" &&
  value !== null &&
  "_tag" in value &&
  typeof value["_tag"] === "string" &&
  ErrorTagValues.includes(value["_tag"]);
