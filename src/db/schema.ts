import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const diariesTable = sqliteTable("diaries", {
  id: int().primaryKey({ autoIncrement: true }).notNull(),
  name: text().notNull(),
  description: text(),
  createdAt: int("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const entriesTable = sqliteTable("entries", {
  id: int().primaryKey({ autoIncrement: true }).notNull(),
  diaryId: int()
    .references(() => diariesTable.id, { onDelete: "cascade" })
    .notNull(),
  title: text().notNull(),
  body: text(),
  createdAt: int("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
