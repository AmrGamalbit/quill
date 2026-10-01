import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  saveDiary as addDiaryToDb,
  deleteDiary as deleteDiaryFromDb,
  getAllDiaries,
  getDiarySummary,
} from "../db/diaries";
import type { Diary } from "../types/diary";

export default function useDiaries() {
  const [diaries, setDiaries] = useState<Diary[]>([]);

  const refresh = useCallback(async () => {
    const rawDiaries = await getAllDiaries();
    const diariesWithSummary = await Promise.all(
      rawDiaries.map(async (diary) => {
        const summary = await getDiarySummary(diary.id);
        return {
          ...diary,
          entryCount: summary.entryCount,
          latestEntryBody: summary.latestEntryBody,
        };
      }),
    );
    setDiaries(diariesWithSummary);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const addDiary = async (name: string, description: string): Promise<void> => {
    await addDiaryToDb(name, description);
    await refresh();
  };

  const deleteDiary = async (diaryId: number) => {
    await deleteDiaryFromDb(diaryId);
    await refresh();
  };

  return { diaries, refresh, addDiary, deleteDiary };
}
