export class FetchNotOkError {
  readonly _tag = "FetchNotOkError";
  constructor(readonly message: string) {}
}

export class DataParseError {
  readonly _tag = "DataParseError";
  constructor(readonly message: string) {}
}

export class DataNotFoundError {
  readonly _tag = "DataNotFoundError";
  constructor(readonly message: string) {}
}
