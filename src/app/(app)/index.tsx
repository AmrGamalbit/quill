import EmptyArt from "@/assets/images/empty.svg";
import Auth from "@/src/components/Auth";
import DiaryCard from "@/src/components/DiaryCard";
import DiaryForm from "@/src/components/DiaryForm";
import EntriesList from "@/src/components/EntriesList";
import FloatingActionButton from "@/src/components/FloatingActionButton";
import GreetingHeader from "@/src/components/GreetingHeader";
import SettingsModal from "@/src/components/SettingsModal";
import { spacing } from "@/src/constants/spacings";
import { fonts, fontSizes } from "@/src/constants/typography";
import useDiaries from "@/src/hooks/useDiaries";
import useTheme from "@/src/hooks/useTheme";
import type { Diary, DiaryFormData } from "@/src/types/diary";
import { subscribeToAuthState } from "@/src/utils/auth";
import { JournalEntry } from "@/src/utils/db";
import { Ionicons } from "@expo/vector-icons";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Home() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { colors } = useTheme();

  const styles = getStyles(colors);

  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [showDiaryForm, setShowDiaryForm] = useState(false);
  const [currentView, setCurrentView] = useState<
    "diaries" | "entries" | "editor"
  >("diaries");
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const { diaries, deleteDiary, addDiary } = useDiaries();
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

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((newSession) => {
      setSession(newSession);
      setIsAuthLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleAddDiary = async (data: DiaryFormData) => {
    const trimmed = data.name.trim();
    if (!trimmed) return;
    await addDiary(trimmed, data.description.trim());
    setShowDiaryForm(false);
  };

  const handleDeleteDiary = async (id: string) => {
    await deleteDiary(Number(id));
  };

  if (isAuthLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? "#4E9E80" : "#1B4938"}
        />
      </SafeAreaView>
    );
  }
  if (!session) {
    return <Auth />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerTextGroup}>
              <GreetingHeader name="Alex" />
              {/*   <DatePill /> */}
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setIsSettingsOpen(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={styles.settingsIconColor.color}
              />
            </TouchableOpacity>
          </View>
          <FlatList
            data={diaries}
            keyExtractor={(item) => item.id}
            contentContainerStyle={
              diaries.length === 0 ? styles.emptyContainer : undefined
            }
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <EmptyArt width={220} height={220} />
                <Text style={styles.noDiaryText}>No Diaries Yet.</Text>
                <Text style={{ color: colors.textMuted }}>
                  Join or create a new one.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <DiaryCard
                diary={item}
                onPress={() => {
                  router.push(`/(app)/diary/${item.id}`);
                  // setSelectedDiary(item);
                  // loadEntriesForDiary(item.id);
                  // setCurrentView("entries");
                  // slideInEntries();
                }}
                onDelete={(id) => handleDeleteDiary(id)}
              />
            )}
          />
        </View>

        <DiaryForm
          isOpen={showDiaryForm}
          onClose={() => setShowDiaryForm(false)}
          onSubmit={handleAddDiary}
        />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          userEmail={session?.user?.email}
        />
        <FloatingActionButton
          onPress={() => {
            setShowDiaryForm(true);
          }}
        />
      </View>

      {/* Full-Screen Sliding Entries Layer */}
      {selectedDiary && (
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
                    setSelectedDiary(null);
                    loadDiaries();
                    setCurrentView("diaries");
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
                  ← {selectedDiary.name}
                </Text>
              </TouchableOpacity>
            </View>

            <EntriesList
              entries={entries}
              onNewEntry={() => {
                setSelectedEntry(null);
                setCurrentView("editor");
              }}
              onSelectEntry={(entry) => {
                setSelectedEntry(entry);
                setCurrentView("editor");
              }}
              onDeleteEntry={handleDeleteEntry}
            />
          </SafeAreaView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    screen: { flex: 1 },
    content: { padding: spacing.lg, flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    headerTextGroup: {
      flex: 1,
    },
    settingsButton: {
      padding: 6,
      borderRadius: 20,
      marginTop: 4,
    },
    settingsIconColor: {
      color: "#62726E",
    },
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
    emptyList: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    emptyContainer: {
      flexGrow: 1, // Crucial: lets the scroll surface expand to fill the full height
      justifyContent: "center",
      alignItems: "center",
    },
    noDiaryText: {
      fontSize: fontSizes.xl,
      fontWeight: "600",
      fontFamily: fonts.label,
      color: colors.text,
    },
  });
