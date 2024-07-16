export function isValidDate(date: Date): boolean {
  /**
   * Date.prototype.getTime() returns NaN
   * If the date is invalid
   */
  return !Number.isNaN(date.getTime());
}

export function assertDateTime(str: string): asserts str is DateTime {
  const isValid = isValidDate(new Date(str));
  if (!isValid) {
    throw new Error(`Assertion Failed: ${str} is invalid date format.`);
  }
}

export function isLeapYear(year: number) {
  return new Date(year, 1, 29).getDate() === 29;
}

export function convertDateToDateTime(date: Date): DateTime {
  return makeDateTime(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export type DateTime = `${number}-${number}-${number}`;
export function makeDateTime(year: number, month: number, day: number): DateTime {
  const candidate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  assertDateTime(candidate);
  return candidate;
}
