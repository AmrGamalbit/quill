import { drizzle } from "drizzle-orm/expo-sqlite";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import * as SQLite from "expo-sqlite";
import * as schema from "./schema";

const DB_NAME = "quill.sqlite";
const DB_KEY_ID = "quill.db.key";

const DB_KEY_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

export const sqlite = SQLite.openDatabaseSync(DB_NAME);

export type DbStatus = "ready" | "locked";

function unlockDatabase(): DbStatus {
  if (!sqlite.getFirstSync("PRAGMA cipher_version;")) {
    throw new Error(
      "SQLCipher is not available in this build. Enable `useSQLCipher` for expo-sqlite in app.json bro sir + rebuild dev client.",
    );
  }

  let storedKey: string | null;
  try {
    storedKey = SecureStore.getItem(DB_KEY_ID);
  } catch {
    return "locked";
  }

  const key = storedKey ?? toHex(Crypto.getRandomBytes(32));

  try {
    sqlite.execSync(`PRAGMA key = "x'${key}'";`);
    sqlite.getFirstSync("SELECT count(*) FROM sqlite_master;");
  } catch {
    return "locked";
  }

  if (storedKey === null) {
    try {
      SecureStore.setItem(DB_KEY_ID, key, DB_KEY_OPTIONS);
    } catch {
      return "locked";
    }
  }
  return "ready";
}

export const dbStatus: DbStatus = unlockDatabase();
export const db = drizzle(sqlite, { schema });

export const resetLockedDatabase = async () => {
  sqlite.closeSync();
  await SQLite.deleteDatabaseAsync(DB_NAME);
  await SecureStore.deleteItemAsync(DB_KEY_ID);
};

export const clearLocalDatabase = async () => {
  await db.transaction(async (tx) => {
    await tx.delete(schema.entriesTable);
    await tx.delete(schema.diariesTable);
    await tx.delete(schema.appStateTable);
    await tx.delete(schema.localProfileTable);
  });
  sqlite.execSync("VACUUM;");
};
