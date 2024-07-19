export async function safeAsyncRun<TFunc extends (...args: any[]) => Promise<any>>(
  func: TFunc,
): Promise<Awaited<ReturnType<TFunc> | false>> {
  try {
    return await func();
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function retry<TFunc extends (...args: any[]) => Promise<any>>(
  fun: TFunc,
  opts: {
    maxRetryCount: number;
    waitMS: number;
  },
  currentRetryCount = 0,
): Promise<ReturnType<TFunc>> {
  try {
    return await fun();
  } catch (e) {
    if (currentRetryCount === opts.maxRetryCount) {
      throw e;
    }
    await new Promise((res) => setTimeout(res, opts.waitMS));
    return retry(fun, { ...opts }, currentRetryCount + 1);
  }
}
