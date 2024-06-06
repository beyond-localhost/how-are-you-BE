export function convertDateToDateTime(date: Date): DateTime {
  return makeDateTime(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export type DateTime = `${number}-${number}-${number}`;
export function makeDateTime(year: number, month: number, day: number): DateTime {
  const candidate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  assertDateTime(candidate);
  return candidate;
}

export function assertDateTime(str: string): asserts str is DateTime {
  try {
    const d = new Date();
    const h = d.getHours();
    if (Number.isNaN(h)) {
      throw new Error();
    }
  } catch (e: unknown) {
    throw new Error(`The argument ${str} doesn't have valid DateTime scheme.`, {
      cause: e,
    });
  }
}
