export type LooselyValidURL = string & { __brand: "LooselyValidURL" };

export function assertURL(urlLike: string): asserts urlLike is LooselyValidURL {
  if (URL.canParse(urlLike)) {
    return;
  }
  throw new Error("The URL cannot be parsed.");
}

export function isValidURL(urlLike: string): urlLike is LooselyValidURL {
  try {
    assertURL(urlLike);
    return true;
  } catch {
    return false;
  }
}

export function validateURL(urlLike: string): LooselyValidURL {
  assertURL(urlLike);
  return urlLike;
}
