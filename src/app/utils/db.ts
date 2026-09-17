import * as SQLite from "expo-sqlite";

export interface JournalEntry {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export const db = SQLite.openDatabaseSync("journals.db");

export function initDatabase() {
  db.execSync(`
        CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        `);
}

export function saveEntry(title: string, content: string) {
  const statement = db.prepareSync(
    "INSERT INTO entries (title, content) VALUES ($title, $content);",
  );
  return statement.executeSync({ $title: title, $content: content });
}

export function getAllEntries(): JournalEntry[] {
  return db.getAllSync<JournalEntry>(
    "SELECT * FROM entries ORDER BY created_at DESC;",
  );
}
