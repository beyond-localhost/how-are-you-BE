import { drizzle as mysqlDrizzle } from "drizzle-orm/mysql2";

import mysql from "mysql2/promise";
import * as criteriaSchema from "../domain/criteria.entity";
import * as questionSchema from "../domain/question.entity";
import * as userSchema from "../domain/user.entity";

export const createMYSQLConnection = (options: mysql.ConnectionOptions): Promise<mysql.Connection> => {
  return mysql.createConnection(options);
};

export const createMYSQLPool = (options: mysql.ConnectionOptions): mysql.Pool => {
  return mysql.createPool(options);
};

export function createMYSQLDrizzleConnection(instance: mysql.Connection, logger = true) {
  return mysqlDrizzle(instance, {
    schema: { ...userSchema, ...questionSchema, ...criteriaSchema },
    mode: "default",
    logger,
  });
}

export type Conn = ReturnType<typeof createMYSQLDrizzleConnection>;
