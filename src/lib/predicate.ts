export const head = <T>(array: T[]): T => {
  if (array[0] === undefined) {
    throw new Error(`DataNotFoundError: ${array}`);
  }
  return array[0];
};

export const dangerousHead = head;

export const nonNullish = <T>(value: T | undefined | null): T => {
  if (value == null) {
    throw new Error(`DataNotFoundError: ${value}`);
  }
  return value;
};

export const dangerousNonNullish = nonNullish;
