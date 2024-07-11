import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { drizzle as mysqlDrizzle } from "drizzle-orm/mysql2";
// import * as schema from "./schema";
import * as userSchema from "../domain/user.entity";
import * as questionSchema from "../domain/question.entity";
import * as criteriaSchema from "../domain/criteria.entity";
import mysql from "mysql2/promise";

export function createConnection(path = "sqlite.db") {
  const sqlite = new Database(path);
  console.log("Try to enable foreign key constraints..");
  sqlite.exec("PRAGMA foreign_keys = ON");
  console.log(sqlite.query(`PRAGMA foreign_keys;`).values());
  return sqlite;
}

export const createMYSQLConnection = (options: mysql.ConnectionOptions): Promise<mysql.Connection> => {
  return mysql.createConnection(options);
};

export const createMYSQLPool = (options: mysql.ConnectionOptions): mysql.Pool => {
  return mysql.createPool(options);
};

export function createDrizzle(db: Database) {
  return drizzle(db, { schema: { ...userSchema, ...questionSchema, ...criteriaSchema }, logger: false });
}

export function createMYSQLDrizzleConnection(instance: mysql.Connection, logger = false) {
  return mysqlDrizzle(instance, {
    schema: { ...userSchema, ...questionSchema, ...criteriaSchema },
    mode: "default",
    logger,
  });
}

export type Conn = ReturnType<typeof createDrizzle>;
export type Conn2 = ReturnType<typeof createMYSQLDrizzleConnection>;
