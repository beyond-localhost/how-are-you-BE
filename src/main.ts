import { resolveEnv } from "./env";
import { createApp } from "./runtime/app";

async function main() {
  const env = resolveEnv();
  const app = await createApp();
  app.listen(env.Server.Port);
}

main().catch(console.error);
