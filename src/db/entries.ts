import { count, eq } from "drizzle-orm";
import { db } from ".";
import type { Entry } from "../types/entry";
import { entriesTable as entries } from "./schema";

export const getEntriesByDiaryId = async (
  diaryId: number,
): Promise<Entry[]> => {
  return await db.select().from(entries).where(eq(entries.diaryId, diaryId));
};

export const saveEntry = async (
  diaryId: number,
  title: string,
  entryDate: string,
  body: string,
): Promise<number> => {
  const result = await db
    .insert(entries)
    .values({ diaryId, title, entryDate, body });
  return result.lastInsertRowId;
};

export const updateEntry = async (
  id: number,
  title: string,
  entryDate: string,
  body: string,
): Promise<void> => {
  await db
    .update(entries)
    .set({ title: title, entryDate: entryDate, body: body })
    .where(eq(entries.id, id));
};

export const getEntryById = async (entryId: number): Promise<Entry | null> => {
  const result = await db.select().from(entries).where(eq(entries.id, entryId));
  return result[0] ?? null;
};

export const getEntryCount = async (diaryId: number): Promise<number> => {
  const result = await db
    .select({ count: count() })
    .from(entries)
    .where(eq(entries.diaryId, diaryId));
  return result[0].count ?? 0;
};

export const getAllEntries = async (): Promise<Entry[]> => {
  return await db.select().from(entries);
};

export const deleteEntry = async (id: number): Promise<void> => {
  await db.delete(entries).where(eq(entries.id, id));
};
