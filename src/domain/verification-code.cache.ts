interface VerificatoinCodeCacheData {
  code: string;
  startEpochTime: number; // millis
}

interface InmemoryVerificationCodeCache {
  setCode(email: string, code: string): Promise<VerificatoinCodeCacheData>;
  getCode(email: string): Promise<VerificatoinCodeCacheData | undefined>;
  deleteCode(email: string): Promise<void>;
}

export class VerificationCodeCache implements InmemoryVerificationCodeCache {
  private readonly cache = new Map<string, VerificatoinCodeCacheData>();

  private createCacheData(code: string): VerificatoinCodeCacheData {
    return { code, startEpochTime: Date.now() };
  }

  setCode(email: string, code: string): Promise<VerificatoinCodeCacheData> {
    const c = this.createCacheData(code);
    this.cache.set(email, c);
    return Promise.resolve(c);
  }

  getCode(email: string): Promise<VerificatoinCodeCacheData | undefined> {
    return Promise.resolve(this.cache.get(email));
  }

  deleteCode(email: string): Promise<void> {
    this.cache.delete(email);
    return Promise.resolve();
  }
}
