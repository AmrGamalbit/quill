import { count, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { db } from ".";
import type { DiaryColorKey } from "../constants/colors";
import type { Diary, DiaryRow } from "../types/diary";
import {
  appStateTable as appState,
  diariesTable as diaries,
  entriesTable as entries,
} from "./schema";

export const getAllDiaries = async (): Promise<Diary[]> => {
  return await db
    .select({ ...getTableColumns(diaries), entryCount: count(entries.id) })
    .from(diaries)
    .leftJoin(entries, eq(entries.diaryId, diaries.id))
    .groupBy(diaries.id)
    .orderBy(
      desc(sql`coalesce(${diaries.lastOpenedAt}, ${diaries.createdAt} * 1000)`),
      desc(diaries.id),
    );
};

export const getDiaryById = async (id: number): Promise<DiaryRow> => {
  const [diary] = await db.select().from(diaries).where(eq(diaries.id, id));
  return diary;
};

export const saveDiary = async (
  name: string,
  color: DiaryColorKey,
): Promise<number> => {
  const result = await db.insert(diaries).values({ name, color });
  return result.lastInsertRowId;
};

export const deleteDiary = async (id: number): Promise<void> => {
  await db.delete(diaries).where(eq(diaries.id, id));
};

export const openDiary = (id: number): boolean =>
  db.transaction((tx) => {
    const { changes } = tx
      .update(diaries)
      .set({ lastOpenedAt: new Date() })
      .where(eq(diaries.id, id))
      .run();
    if (changes === 0) return false;
    tx.insert(appState)
      .values({ id: 1, resumeDiaryId: id })
      .onConflictDoUpdate({ target: appState.id, set: { resumeDiaryId: id } })
      .run();
    return true;
  });
