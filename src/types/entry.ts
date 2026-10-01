import { entriesTable as entries } from "../db/schema";

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
