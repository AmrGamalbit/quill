import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import * as schema from "./schema";

export const sqlite = SQLite.openDatabaseSync("quill.sqlite");
export const db = drizzle(sqlite, { schema });

export const clearLocalDatabase = async () => {
  await db.transaction(async (tx) => {
    await tx.delete(schema.entriesTable);
    await tx.delete(schema.diariesTable);
    await tx.delete(schema.localProfileTable);
  });
};
