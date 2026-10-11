import EntriesList from "@/src/components/EntriesList";
import { setResumeDiaryId } from "@/src/db/appState";
import { getDiaryById, openDiary } from "@/src/db/diaries";
import useEntries from "@/src/hooks/useEntries";
import useTheme from "@/src/hooks/useTheme";
import { deleteEntryWithMedia } from "@/src/services/attachments";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";

export default function DiaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const diaryId = Number(id);
  const { colors } = useTheme();
  const router = useRouter();
  const { entries, refresh } = useEntries(diaryId);
  const [diaryName, setDiaryName] = useState<string>();

  const closeDiary = useCallback(() => {
    setResumeDiaryId(null);
    router.replace("/(app)");
  }, [router]);

  useEffect(() => {
    if (!Number.isInteger(diaryId) || !openDiary(diaryId)) closeDiary();
  }, [diaryId, closeDiary]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getDiaryById(diaryId).then((diary) => {
        if (active && diary) setDiaryName(diary.name);
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
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <EntriesList
      entries={entries}
      diaryName={diaryName}
      onClose={closeDiary}
      onNewEntry={() => router.push(`/(app)/diary/${diaryId}/new-entry`)}
      onSelectEntry={(entry) =>
        router.push(`/(app)/diary/${diaryId}/entries/${entry.id}`)
      }
      onDeleteEntry={handleDeleteEntry}
      />
    </View>
  );
}
