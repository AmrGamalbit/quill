import EntriesList from "@/src/components/EntriesList";
import { spacing } from "@/src/constants/spacings";
import type { JournalEntry } from "@/src/utils/db";
import { deleteEntry, getEntriesByDiaryId } from "@/src/utils/db";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
export default function DiaryScreen() {
  const { id } = useLocalSearchParams();
  const diaryId = Number(id);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getStyles();
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const router = useRouter();

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
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={[
            styles.navBar,
            { borderBottomColor: isDark ? "#283934" : "#E5EBE8" },
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              slideOutEntries(() => {
                router.push("/(app)");
              });
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={[
                styles.backButtonText,
                { color: isDark ? "#4E9E80" : "#1B4938" },
              ]}
            >
              {/* ← {selectedDiary.name} */ "diary"}
            </Text>
          </TouchableOpacity>
        </View>

        <EntriesList
          entries={entries}
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
