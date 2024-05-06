import { DataNotFoundError } from "../core/error";

export const head = <T>(array: T[]): T | DataNotFoundError => {
  if (array[0] === undefined) {
    return new DataNotFoundError("DataNotFoundError while calling head");
  }
  return array[0];
};

export const dangerousHead = <T>(array: T[]): T => {
  const ret = head(array);
  if (ret instanceof DataNotFoundError) {
    throw ret;
  }
  return ret;
};
