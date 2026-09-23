import { eq } from "drizzle-orm";
import { db } from ".";
import { diariesTable as diaries } from "./schema";

export type Diary = typeof diaries.$inferSelect;

export const getAllDiaries = async (): Promise<Diary[]> => {
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
