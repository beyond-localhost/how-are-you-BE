import { DataNotFoundError, dataNotFoundError, isError } from "../core/error";

export const head = <T>(array: T[]): T | DataNotFoundError => {
  if (array[0] === undefined) {
    return dataNotFoundError();
  }
  return array[0];
};

export const dangerousHead = <T>(array: T[]): T => {
  const ret = head(array);
  if (isError(ret)) {
    throw ret;
  }
  return ret;
};

export const nonNullish = <T>(
  value: T | undefined | null
): T | DataNotFoundError => {
  if (value == null) {
    return dataNotFoundError();
  }
  return value;
};

export const dangerousNonNullish = <T>(value: T | undefined | null): T => {
  const ret = nonNullish(value);
  if (isError(ret)) {
    throw ret;
  }
  return ret;
};
