export const head = <T>(array: T[]): T => {
  if (array[0] === undefined) {
    if (array.length === 0) {
      throw new Error(`DataNotFoundError: ${array}`);
    }
  }
  // ([undefined]) should return undefined
  return array[0] as T;
};

export const dangerousHead = head;

export const nonNullish = <T>(value: T | undefined | null): T => {
  if (value == null) {
    throw new Error(`DataNotFoundError: ${value}`);
  }
  return value;
};

export const dangerousNonNullish = nonNullish;
