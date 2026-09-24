import { useCallback } from "react";
const loadEntriesForDiary = useCallback(async (diaryId: string) => {
  const data = await getEntriesByDiaryId(Number(diaryId));
  setEntries(data);
}, []);
const handleDeleteEntry = (entryId: number) => {
  deleteEntry(entryId);
  if (selectedDiary) {
    loadEntriesForDiary(selectedDiary.id);
    loadDiaries();
  }
};
