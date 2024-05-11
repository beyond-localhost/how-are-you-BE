import { eq } from "drizzle-orm";
import type { Conn } from "./rdb";
import { users, type CreateUserDto, type User } from "./user.entity";
import { dangerousHead, head } from "../lib/predicate";
import type { DataNotFoundError } from "../core/error";

export const findUserByExternalId = async (
  conn: Conn,
  externalId: string
): Promise<User | DataNotFoundError> =>
  conn.select().from(users).where(eq(users.externalId, externalId)).then(head);

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
