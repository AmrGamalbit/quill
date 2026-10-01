import EntriesList from "@/src/components/EntriesList";
import { spacing } from "@/src/constants/spacings";
import { getDiaryById } from "@/src/db/diaries";
import useEntries from "@/src/hooks/useEntries";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
export default function DiaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const diaryId = Number(id);
  const { entries, deleteEntry } = useEntries(diaryId);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getStyles();
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const router = useRouter();
  const [diaryName, setDiaryName] = useState<string>();

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const loadDiaryName = async () => {
        const targetDiary = await getDiaryById(diaryId);
        if (isMounted) setDiaryName(targetDiary.name);
      };
      loadDiaryName();
      return () => (isMounted = false);
    }, [diaryId]),
  );

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

  const handleDeleteEntry = (entryId: number) => {
    deleteEntry(entryId);
  };

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
      <SafeAreaView style={{ flex: 1 }}>
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
      </SafeAreaView>
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
