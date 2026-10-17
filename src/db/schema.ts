import { sql } from "drizzle-orm";
import { check, index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const diariesTable = sqliteTable("diaries", {
  id: int().primaryKey({ autoIncrement: true }).notNull(),
  name: text().notNull(),
  description: text(),
  color: text().notNull().default("cobalt"),
  lastOpenedAt: int("last_opened_at", { mode: "timestamp_ms" }),
  createdAt: int("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const appStateTable = sqliteTable(
  "app_state",
  {
    id: int().primaryKey().notNull(),
    resumeDiaryId: int("resume_diary_id").references(() => diariesTable.id, {
      onDelete: "set null",
    }),
  },
  (t) => [check("app_state_singleton", sql`${t.id} = 1`)],
);


export const entriesTable = sqliteTable(
  "entries",
  {
    id: int().primaryKey({ autoIncrement: true }).notNull(),
    diaryId: int("diary_id")
      .references(() => diariesTable.id, { onDelete: "cascade" })
      .notNull(),
    title: text().notNull(),
    body: text(),
    entryDate: text("entry_date").notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: int("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (e) => [index("idx_entries_diary_date").on(e.diaryId, e.entryDate)],
);

export const localProfileTable = sqliteTable("local_profile", {
  userId: text("user_id").primaryKey().notNull(),
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
    entryId: int("entry_id")
      .references(() => entriesTable.id, { onDelete: "cascade" })
      .notNull(),
    kind: text('kind', {enum: ['image', 'video', 'audio']}).notNull(),
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
