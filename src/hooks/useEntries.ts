import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  deleteEntry as deleteEntryFromDb,
  getEntriesByDiaryId,
  saveEntry as saveEntryToDb,
} from "../db/entries";
import type { Entry } from "../types/entry";

export default function useEntries(diaryId: number) {
  const [entries, setEntries] = useState<Entry[]>([]);

  const refresh = useCallback(async () => {
    setEntries(await getEntriesByDiaryId(diaryId));
  }, [diaryId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const addEntry = async (title: string, body: string): Promise<void> => {
    console.log("add entry");
    const a = await saveEntryToDb(diaryId, title, body);
    console.log(a);
    console.log(diaryId);
    console.log(title);
    await refresh();
  };

  const deleteEntry = async (entryId: number) => {
    await deleteEntryFromDb(entryId);
    await refresh();
  };

  return { entries, refresh, addEntry, deleteEntry };
}
