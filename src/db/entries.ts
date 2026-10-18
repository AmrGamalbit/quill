import { and, count, eq } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import { db } from ".";
import type { Entry } from "../types/entry";
import { entriesTable as entries } from "./schema";

export const getEntriesByDiaryId = async (
  diaryId: number,
): Promise<Entry[]> => {
  return (await db
    .select()
    .from(entries)
    .where(
      and(eq(entries.diaryId, diaryId), eq(entries.deleted, 0)),
    )) as Entry[];
};

export const saveEntry = async (
  diaryId: number,
  title: string,
  entryDate: string,
  body: string,
  authorId?: string,
): Promise<number> => {
  const remoteId = Crypto.randomUUID();
  const result = await db.insert(entries).values({
    remoteId,
    diaryId,
    authorId: authorId ?? null,
    title,
    entryDate,
    body,
    version: 1,
    keyEpoch: 1,
    deleted: 0,
    syncState: "pending_insert",
  });
  return result.lastInsertRowId;
};

export const updateEntry = async (
  id: number,
  title: string,
  entryDate: string,
  body: string,
): Promise<void> => {
  const [existing] = await db.select().from(entries).where(eq(entries.id, id));
  if (!existing) return;

  const nextState =
    existing.syncState === "pending_insert"
      ? "pending_insert"
      : "pending_update";

  await db
    .update(entries)
    .set({
      title,
      entryDate,
      body,
      syncState: nextState,
      updatedAt: new Date(),
    })
    .where(eq(entries.id, id));
};

export const getEntryById = async (entryId: number): Promise<Entry | null> => {
  const result = await db
    .select()
    .from(entries)
    .where(and(eq(entries.id, entryId), eq(entries.deleted, 0)));
  return (result[0] as Entry) ?? null;
};

export const getEntryCount = async (diaryId: number): Promise<number> => {
  const result = await db
    .select({ count: count() })
    .from(entries)
    .where(and(eq(entries.diaryId, diaryId), eq(entries.deleted, 0)));
  return result[0].count ?? 0;
};

export const getAllEntries = async (): Promise<Entry[]> => {
  return (await db
    .select()
    .from(entries)
    .where(eq(entries.deleted, 0))) as Entry[];
};

export const deleteEntry = async (id: number): Promise<void> => {
  const [existing] = await db.select().from(entries).where(eq(entries.id, id));
  if (!existing) return;

  if (existing.syncState === "pending_insert") {
    await db.delete(entries).where(eq(entries.id, id));
  } else {
    await db
      .update(entries)
      .set({ deleted: 1, syncState: "pending_delete", updatedAt: new Date() })
      .where(eq(entries.id, id));
  }
};
