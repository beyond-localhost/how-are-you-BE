export type LooselyValidURL = string & { __brand: "LooselyValidURL" };

export function assertURL(urlLike: string): asserts urlLike is LooselyValidURL {
  if (URL.canParse(urlLike)) {
    return;
  }
  throw new Error("The URL cannot be parsed.");
}
