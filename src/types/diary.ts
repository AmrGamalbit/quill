import { diariesTable as diaries } from "../db/schema";

export type DiaryRow = typeof diaries.$inferSelect;
export type DiaryStats = {
  entryCount: number;
  latestEntryBody: string | null;
};
export type Diary = DiaryRow & DiaryStats;
export type DiaryFormData = { name: string; description: string };
