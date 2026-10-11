import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import type { DiaryColorKey } from "../constants/colors";
import { saveDiary as addDiaryToDb, getAllDiaries } from "../db/diaries";
import { deleteDiaryWithMedia } from "../services/attachments";
import type { Diary } from "../types/diary";

export default function useDiaries() {
  const [diaries, setDiaries] = useState<Diary[]>([]);

  const refresh = useCallback(async () => {
    setDiaries(await getAllDiaries());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );
  const addDiary = async (
    name: string,
    color: DiaryColorKey,
  ): Promise<void> => {
    await addDiaryToDb(name, color);
    await refresh();
  };
  const deleteDiary = async (diaryId: number): Promise<void> => {
    await deleteDiaryWithMedia(diaryId);
    await refresh();
  };

  return { diaries, refresh, addDiary, deleteDiary };
}
