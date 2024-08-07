import { eq } from "drizzle-orm";
import { dangerousHead } from "../lib/predicate";
import type { Conn } from "./rdb";
import {
  type CreateExternalIdentity,
  type CreateSessionDto,
  type CreateUserDto,
  type CreateUserProfileDto,
  type CreateUserProfilesToWorries,
  externalIdentities,
  type ExternalIdentity,
  sessions,
  type User,
  userProfiles,
  userProfilesToWorries,
  users,
} from "./user.entity";

export const findExternalIdentityWithUserById = async (
  conn: Conn,
  id: string,
): Promise<(ExternalIdentity & { users: User }) | undefined> =>
  conn.query.externalIdentities.findFirst({
    where: eq(externalIdentities.id, id),
    with: {
      users: true,
    },
  });

export const createExternalIdentities = async (tx: Conn, dto: CreateExternalIdentity) =>
  tx.insert(externalIdentities).values(dto);

export const findUserByIdOrFail = async (conn: Conn, id: number): Promise<User> =>
  conn.select().from(users).where(eq(users.id, id)).then(dangerousHead);

export const findUserBySessionId = async (conn: Conn, sessionId: number) =>
  conn.query.sessions.findFirst({ where: eq(sessions.id, sessionId), with: { user: true } });

export const deleteSession = async (conn: Conn, sessionId: number) => {
  await conn.delete(sessions).where(eq(sessions.id, sessionId));
};

export const createUser = async (conn: Conn, dto: CreateUserDto): Promise<User> => {
  const { id } = await conn.insert(users).values(dto).$returningId().then(dangerousHead);
  return conn.select().from(users).where(eq(users.id, id)).then(dangerousHead);
};

export const createSession = async (tx: Conn, dto: CreateSessionDto) => {
  const { id } = await tx.insert(sessions).values(dto).$returningId().then(dangerousHead);
  return tx.select().from(sessions).where(eq(sessions.id, id)).then(dangerousHead);
};

export const createUserProfile = async (tx: Conn, dto: CreateUserProfileDto) => {
  await tx.insert(userProfiles).values(dto);
  return tx.select().from(userProfiles).where(eq(userProfiles.id, dto.id)).then(dangerousHead);
};
export const createUserWorries = async (tx: Conn, worries: CreateUserProfilesToWorries[]) =>
  tx.insert(userProfilesToWorries).values(worries);

export const findUserProfileByUserId = async (conn: Conn, userId: number) =>
  conn.query.userProfiles.findFirst({
    where: eq(userProfiles.id, userId),
    with: { job: true, userProfilesToWorries: { with: { worry: true } } },
  });
