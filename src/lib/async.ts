export async function safeAsyncRun<
  TFunc extends (...args: any[]) => Promise<any>
>(func: TFunc): Promise<Awaited<ReturnType<TFunc> | false>> {
  try {
    return await func();
  } catch (e) {
    console.error(e);
    return false;
  }
}
