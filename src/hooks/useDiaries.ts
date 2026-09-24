import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    saveDiary as addDiaryToDb,
    deleteDiary as deleteDiaryFromDb,
    getAllDiaries,
} from "../db/diaries";

export default function useDiaries() {
  const [diaries, setDiaries] = useState([]);
  const loadDiaries = async () => {
    const result = await loadDiaries();
    setDiaries(result);
  };

  const refresh = useCallback(async () => {
    setDiaries(await getAllDiaries());
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
