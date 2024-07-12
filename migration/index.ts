import { runMigrate } from "./migrate";
import { resolveEnv } from "../src/env";

runMigrate(resolveEnv().Database).catch(console.error);
