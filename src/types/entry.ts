import { entriesTable as entries } from "../db/schema";
import type { AttachmentCounts } from "./attachment";

export type Entry = typeof entries.$inferSelect;
export type EntryWithCounts = Entry & { counts: AttachmentCounts };
export type NewEntry = typeof entries.$inferInsert;
