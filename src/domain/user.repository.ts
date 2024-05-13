import { eq } from "drizzle-orm";
import type { Conn } from "./rdb";
import {
  externalIdentities,
  users,
  type CreateExternalIdentity,
  type CreateUserDto,
  type User,
} from "./user.entity";
import { dangerousHead, head } from "../lib/predicate";
import type { DataNotFoundError } from "../core/error";

export const createExternalIdentities = async (
  tx: Conn,
  dto: CreateExternalIdentity
) => tx.insert(externalIdentities).values(dto).returning().then(dangerousHead);

export const findUserByEmail = async (
  conn: Conn,
  email: string
): Promise<User | DataNotFoundError> =>
  conn.select().from(users).where(eq(users.email, email)).then(head);

export const findUserById = async (
  conn: Conn,
  id: number
): Promise<User | DataNotFoundError> =>
  conn.select().from(users).where(eq(users.id, id)).then(head);

export const createUser = async (
  conn: Conn,
  dto: CreateUserDto
): Promise<User> =>
  conn.insert(users).values(dto).returning().then(dangerousHead);
