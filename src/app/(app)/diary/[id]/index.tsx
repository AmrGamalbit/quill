import EntriesList from "@/src/components/EntriesList";
import FloatingActionButton from "@/src/components/FloatingActionButton";
import { useDiaryTransition } from "@/src/context/DiaryTransitionContext";
import { setResumeDiaryId } from "@/src/db/appState";
import { getDiaryById, openDiary } from "@/src/db/diaries";
import useEntries from "@/src/hooks/useEntries";
import useTheme from "@/src/hooks/useTheme";
import { deleteEntryWithMedia } from "@/src/services/attachments";
import type { DiaryRow } from "@/src/types/diary";
import { toDateKey } from "@/src/utils/dates";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DiaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const diaryId = Number(id);
  const { colors } = useTheme();
  const styles = getStyles(colors);
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

  const handleAddEntry = (date?: Date) => {
    router.push({
      pathname: `/(app)/diary/[id]/new-entry`,
      params: date ? { id: diaryId, date: toDateKey(date) } : { id: diaryId },
    });
  };

  const handleDeleteEntry = async (entryId: number) => {
    await deleteEntryWithMedia(entryId);
    refresh();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={styles.screen}
        onLayout={() =>
          requestAnimationFrame(() => requestAnimationFrame(reportReady))
        }
      >
        <Stack.Screen options={{ animation: "none" }} />
        <EntriesList
          entries={entries}
          closing={closing}
          onClose={handleClose}
          diaryName={diaryRow?.name}
          onNewEntry={(date) => handleAddEntry(date)}
          onSelectEntry={(entry) => {
            router.push(`/(app)/diary/${diaryId}/entries/${entry.id}`);
          }}
          onDeleteEntry={(entryId) => handleDeleteEntry(entryId)}
        />
        <FloatingActionButton onPress={() => handleAddEntry()} />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
  });
