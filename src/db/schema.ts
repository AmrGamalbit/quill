import { sql } from "drizzle-orm";
import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

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

export const localProfileTable = sqliteTable("local_profile", {
  userId: text().primaryKey().notNull(),
  name: text().notNull(),
  photoUri: text("photo_uri"),
  publicKey: text("public_key"),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const AttachmentsTable = sqliteTable(
  "attachments",
  {
    id: int().primaryKey({ autoIncrement: true }).notNull(),
    entryId: int()
      .references(() => entriesTable.id, { onDelete: "cascade" })
      .notNull(),
    kind: text().notNull(),
    relPath: text("rel_path").notNull(),
    mimeType: text("mimeType").notNull(),
    width: int(),
    height: int(),
    durationMs: int("duration_ms"),
    sizeBytes: int("size_bytes"),
    name: text(),
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("idx_attachments_entry").on(t.entryId)],
);
