import type { DiaryColorKey } from "../constants/colors";
import { diariesTable as diaries } from "../db/schema";

export type DiaryRow = typeof diaries.$inferSelect;
export type Diary = DiaryRow & { entryCount: number };
export type DiaryFormData = { name: string; color: DiaryColorKey };
