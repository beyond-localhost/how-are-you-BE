import { resolveEnv } from "../src/env";
import { runSeed } from "./seed";
import { createMYSQLConnection, createMYSQLDrizzleConnection } from "../src/domain/rdb";

createMYSQLConnection(resolveEnv().Database).then(createMYSQLDrizzleConnection).then(runSeed);
