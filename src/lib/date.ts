export function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export type DateTime = `${number}-${number}-${number}`;
export function makeDateTime(
  year: number,
  month: number,
  day: number
): DateTime {
  const candidate = `${year}-${month}-${day}`;
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
