import { dataNotFoundError, isError } from "../core/error";

export const head = <T>(
  array: T[]
): T | ReturnType<typeof dataNotFoundError> => {
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
