import { resolveEnv } from "./env";
import { createApp } from "./runtime/app";

async function main() {
  const env = resolveEnv();
  await createApp(env.Server.Port);
}

main().catch(console.error);
