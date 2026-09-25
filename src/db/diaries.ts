import { desc, eq } from "drizzle-orm";
import { db } from ".";
import type { DiaryRow, DiaryStats } from "../types/diary";
import { diariesTable as diaries, entriesTable as entries } from "./schema";

export const getAllDiaries = async (): Promise<DiaryRow[]> => {
  return await db.select().from(diaries);
};

export const saveDiary = async (
  name: string,
  description: string,
): Promise<number> => {
  const result = await db.insert(diaries).values({ name, description });
  return result.lastInsertRowId;
};

export const deleteDiary = async (id: number): Promise<void> => {
  await db.delete(diaries).where(eq(diaries.id, id));
};

export const getDiarySummary = async (diaryId: number): Promise<DiaryStats> => {
  const entryCount = await db.$count(entries, eq(entries.diaryId, diaryId));
  const latestEntryBody = await db
    .select({ body: entries.body })
    .from(entries)
    .where(eq(entries.diaryId, diaryId))
    .orderBy(desc(entries.createdAt))
    .limit(1);
  return {
    entryCount,
    latestEntryBody: latestEntryBody[0].body ?? null,
  };
};
