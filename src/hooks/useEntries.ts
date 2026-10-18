import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  deleteEntry as deleteEntryFromDb,
  getEntriesByDiaryId,
} from "../db/entries";
import type { EntryWithCounts } from "../types/entry";

export default function useEntries(diaryId: number) {
  const [entries, setEntries] = useState<EntryWithCounts[]>([]);

  const refresh = useCallback(async () => {
    setEntries(await getEntriesByDiaryId(diaryId));
  }, [diaryId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const deleteEntry = async (entryId: number) => {
    await deleteEntryFromDb(entryId);
    await refresh();
  };

  return { entries, refresh, deleteEntry };
}
