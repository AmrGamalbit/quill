import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const diariesTable = sqliteTable("diaries", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  createdAt: text().notNull(),
});

export const entriesTable = sqliteTable("entries", {
  id: int().primaryKey({ autoIncrement: true }),
  diaryId: int().references(() => diariesTable.id, { onDelete: "cascade" }),
  title: text().notNull(),
  body: text(),
  createdAt: text()
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text()
    .notNull()
    .default(sql`(datetime('now'))`),
});
