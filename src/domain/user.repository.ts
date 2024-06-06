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
  tx.insert(externalIdentities).values(dto).returning().then(dangerousHead);

export const findUserByIdOrFail = async (conn: Conn, id: number): Promise<User> =>
  conn.select().from(users).where(eq(users.id, id)).then(dangerousHead);

export const findUserBySessionId = async (conn: Conn, sessionId: number) =>
  conn.query.sessions.findFirst({ where: eq(sessions.id, sessionId), with: { user: true } });

export const createUser = async (conn: Conn, dto: CreateUserDto): Promise<User> =>
  conn.insert(users).values(dto).returning().then(dangerousHead);

export const createSession = async (tx: Conn, dto: CreateSessionDto) =>
  tx.insert(sessions).values(dto).returning().then(dangerousHead);

export const createUserProfile = async (tx: Conn, dto: CreateUserProfileDto) =>
  tx.insert(userProfiles).values(dto).returning().then(dangerousHead);
export const createUserWorries = async (tx: Conn, worries: CreateUserProfilesToWorries[]) =>
  tx.insert(userProfilesToWorries).values(worries).returning();

export const findUserProfileByUserId = async (conn: Conn, userId: number) =>
  conn.query.userProfiles.findFirst({
    where: eq(userProfiles.id, userId),
    with: { job: true, userProfilesToWorries: { with: { worry: true } } },
  });
