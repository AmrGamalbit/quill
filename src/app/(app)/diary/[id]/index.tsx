import EntriesList from "@/src/components/EntriesList";
import { spacing } from "@/src/constants/spacings";
import { deleteEntryWithMedia } from "@/src/services/attachments";
import type { JournalEntry } from "@/src/utils/db";
import { getAllDiaries, getEntriesByDiaryId } from "@/src/utils/db";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  useColorScheme
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
export default function DiaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const diaryId = Number(id);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getStyles();
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const router = useRouter();

  const diaryName = getAllDiaries().find((d) => d.id === diaryId)?.name || "Diary";
 // const targetDiary = diaries.find((d) => d.id === diaryId);
 // const diaryName = targetDiary ? targetDiary.name : "Diary";

  const slideInEntries = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  };

  const slideOutEntries = (onComplete?: () => void) => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      if (onComplete) onComplete();
    });
  };

  const handleDeleteEntry = async (entryId: number) => {
    await deleteEntryWithMedia(entryId);
    setEntries(getEntriesByDiaryId(diaryId));
  }

  useFocusEffect(
    useCallback(() => {
      const result = getEntriesByDiaryId(Number(id));
      setEntries(result);
    }, [id]),
  );

  useEffect(() => {
    slideInEntries();
  }, []);

  return (
    <Animated.View
      style={[
        styles.fullScreenSlide,
        {
          backgroundColor: isDark ? "#111715" : "#F8FAF9",
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >


        <EntriesList
          entries={entries}
          onBack={() => router.back()}
          diaryName={diaryName}
          onNewEntry={() => router.push(`/(app)/diary/${diaryId}/new-entry`)}
          onSelectEntry={(entry) => {
            router.push(`/(app)/diary/${diaryId}/entries/${entry.id}`);
          }}
          onDeleteEntry={(entryId) => handleDeleteEntry(entryId)}
        />
    </Animated.View>
  );
}

const getStyles = () =>
  StyleSheet.create({
    navBar: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    fullScreenSlide: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "#F8FAF9",
      zIndex: 10,
    },
  });
