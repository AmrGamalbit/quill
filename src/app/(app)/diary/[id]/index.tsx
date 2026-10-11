import EntriesList from "@/src/components/EntriesList";
import { useDiaryTransition } from "@/src/context/DiaryTransitionContext";
import { setResumeDiaryId } from "@/src/db/appState";
import { getDiaryById, openDiary } from "@/src/db/diaries";
import useEntries from "@/src/hooks/useEntries";
import useTheme from "@/src/hooks/useTheme";
import { deleteEntryWithMedia } from "@/src/services/attachments";
import type { DiaryRow } from "@/src/types/diary";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";

export default function DiaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const diaryId = Number(id);
  const { colors } = useTheme();
  const router = useRouter();
  const { entries, refresh } = useEntries(diaryId);
  const [diaryRow, setDiaryRow] = useState<DiaryRow>();
  const { close, closing, reportReady } = useDiaryTransition();

  const closeDiary = useCallback(() => {
    setResumeDiaryId(null);
    router.replace("/(app)");
  }, [router]);

  const handleClose = useCallback(() => {
    if (!diaryRow) return closeDiary();
    setResumeDiaryId(null);
    close({ ...diaryRow, entryCount: entries.length });
  }, [diaryRow, entries.length, close, closeDiary]);

  useEffect(() => {
    if (!Number.isInteger(diaryId) || !openDiary(diaryId)) closeDiary();
  }, [diaryId, closeDiary]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getDiaryById(diaryId).then((diary) => {
        if (active && diary) setDiaryRow(diary);
      });
      return () => {
        active = false;
      };
    }, [diaryId]),
  );

  const handleDeleteEntry = async (entryId: number) => {
    await deleteEntryWithMedia(entryId);
    refresh();
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background }}
      onLayout={() => requestAnimationFrame(() => requestAnimationFrame(reportReady))}
    >
      <Stack.Screen options={{ animation: "none" }} />
      <EntriesList
        closing={closing}
        entries={entries}
        diaryName={diaryRow?.name}
        onClose={handleClose}
        onNewEntry={() => router.push(`/(app)/diary/${diaryId}/new-entry`)}
        onSelectEntry={(entry) =>
          router.push(`/(app)/diary/${diaryId}/entries/${entry.id}`)
        }
        onDeleteEntry={handleDeleteEntry}
      />
    </View>
  );
}
