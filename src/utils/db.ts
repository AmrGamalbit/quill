import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("diary.db");

export interface Diary {
  id: number;
  name: string;
  created_at: string;
}

export interface JournalEntry {
  id: number;
  diary_id: number;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}
/*export const ensureDefaultDiary = (): number => {
  const existingDiaries = getAllDiaries();

  if (existingDiaries.length > 0) {
    return existingDiaries[0].id;
  }

  return saveDiary("My Diary");
}; */

export function initDatabase() {
  db.execSync(`
    PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS diaries( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description Text,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        diary_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (diary_id) REFERENCES diaries (id) ON DELETE CASCADE
        );
        `);
}

export function getAllDiaries(): Diary[] {
  return db.getAllSync<Diary>(
    `SELECT * FROM  diaries ORDER BY created_at DESC;`,
  );
}

export const saveDiary = (name: string, description: string): number => {
  const statement = db.prepareSync(`
    INSERT INTO diaries (name, description) VALUES (?, ?)`);
  try {
    const result = statement.executeSync([name, description]);
    return result.lastInsertRowId;
  } finally {
    statement.finalizeSync();
  }
};

export const getEntriesByDiaryId = (diaryId: number): JournalEntry[] => {
  const statement = db.prepareSync(`
    SELECT * FROM entries WHERE diary_id = ? ORDER BY created_at DESC
    `);
  try {
    return statement.executeSync([diaryId]).getAllSync() as JournalEntry[];
  } finally {
    statement.finalizeSync();
  }
};
export const saveEntry = (
  diaryId: number,
  title: string,
  body: string,
): number => {
  const statement = db.prepareSync(`
    INSERT INTO entries (diary_id, title, body) VALUES (?, ?, ?)`);
  try {
    const result = statement.executeSync([diaryId, title, body]);
    return result.lastInsertRowId;
  } finally {
    statement.finalizeSync();
  }
};

export function getEntryById(entryId: number): JournalEntry | null {
  const statement = db.prepareSync(`
    SELECT * FROM entries WHERE id = ?
    `);
  try {
    const result = statement
      .executeSync([entryId])
      .getAllSync() as JournalEntry[];
    return result.length > 0 ? result[0] : null;
  } finally {
    statement.finalizeSync();
  }
}

export function getEntryCount(diaryId: number): number {
  const result = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM entries WHERE diary_id = ?;`,
    [diaryId],
  );
  return result?.count ?? 0;
}
/*export function saveEntry(title: string, content: string) {
  const statement = db.prepareSync(
    "INSERT INTO entries (title, content) VALUES ($title, $content);",
  );
  return statement.executeSync({ $title: title, $content: content });
}*/

export function getAllEntries(): JournalEntry[] {
  return db.getAllSync<JournalEntry>(
    "SELECT * FROM entries ORDER BY created_at DESC;",
  );
}
export const deleteDiary = (id: number): void => {
  const statement = db.prepareSync(`DELETE FROM diaries WHERE id = ?`);
  try {
    statement.executeSync([id]);
  } finally {
    statement.finalizeSync();
  }
};
export const deleteEntry = (id: number): void => {
  const statement = db.prepareSync(`DELETE FROM entries WHERE id = ?`);
  try {
    statement.executeSync([id]);
  } finally {
    statement.finalizeSync();
  }
};
