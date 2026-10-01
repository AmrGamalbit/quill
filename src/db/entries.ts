import { count, eq } from "drizzle-orm";
import { db } from ".";
import { entriesTable as entries } from "./schema";
import type { Entry } from "../types/entry";

export const getEntriesByDiaryId = async (
  diaryId: number,
): Promise<Entry[]> => {
  return await db.select().from(entries).where(eq(entries.diaryId, diaryId));
};

export const saveEntry = async (
  diaryId: number,
  title: string,
  body: string,
): Promise<number> => {
  const result = await db.insert(entries).values({ diaryId, title, body });
  return result.lastInsertRowId;
};

export const getEntryById = async (entryId: number): Promise<Entry | null> => {
  const result = await db.select().from(entries).where(eq(entries.id, entryId));
  return result[0] ?? null;
};

export const getEntryCount = async (diaryId: number): Promise<number> => {
  const result = await db
    .select({ count: count() })
    .from(entries)
    .where(eq(entries.id, diaryId));
  return result[0].count ?? 0;
};

export const getAllEntries = async (): Promise<Entry[]> => {
  return await db.select().from(entries);
};

export const deleteEntry = async (id: number): Promise<void> => {
  await db.delete(entries).where(eq(entries.id, id));
};
