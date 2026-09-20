import DatePill from "@/src/components/DatePill";
import DiaryCard from "@/src/components/DiaryCard";
import DiaryForm from "@/src/components/DiaryForm";
import Editor from "@/src/components/Editor";
import EntriesList from "@/src/components/EntriesList";
import FloatingActionButton from "@/src/components/FloatingActionButton";
import GreetingHeader from "@/src/components/GreetingHeader";
import { spacing } from "@/src/constants/spacings";
import type { Diary, DiaryFormData } from "@/src/types/diary";
import {
  deleteDiary,
  deleteEntry,
  getAllDiaries,
  getEntriesByDiaryId,
  initDatabase,
  JournalEntry,
  saveDiary,
} from "@/src/utils/db";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Home() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [showDiaryForm, setShowDiaryForm] = useState(false);
  const [currentView, setCurrentView] = useState<'diaries' | 'entries' | 'editor'>('diaries');
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

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
    })
  }

  const loadDiaries = useCallback(() => {
    const rawDiaries = getAllDiaries();
    const formattedDiaries: Diary[] = rawDiaries.map((d) => {
      const dbEntries = getEntriesByDiaryId(d.id);
      return {
        id: d.id.toString(),
        name: d.name,
        createdAt: d.created_at,
        lastOpenedAt: d.created_at,
        members: ["You"],
        entries: dbEntries.map((e) => ({
          id: e.id.toString(),
          title: e.title,
          body: e.body,
          author: "You",
          createdAt: e.created_at,
        })),
      };
    });
    setDiaries(formattedDiaries);
  }, []);

  useEffect(() => {
    initDatabase();
    loadDiaries();
  }, [loadDiaries]);
  const handleAddDiary = (data: DiaryFormData) => {
    if (!data.name.trim()) return;
    saveDiary(data.name.trim());
    loadDiaries();
    setShowDiaryForm(false);
  };

  const handleDeleteDiary = (id: string) => {
    deleteDiary(Number(id));
    loadDiaries();
  };
  const loadEntriesForDiary = useCallback((diaryId: string) => {
    const data = getEntriesByDiaryId(Number(diaryId));
    setEntries(data);
  }, []);
  const handleDeleteEntry = (entryId: number) => {
    deleteEntry(entryId);
    if (selectedDiary) {
      loadEntriesForDiary(selectedDiary.id);
      loadDiaries();
    }
  }
if (currentView === 'editor' && selectedDiary) {
  return(
  <Editor
  key={selectedEntry ? `entry-${selectedEntry.id}` : `new-entry`}
  diaryId={Number(selectedDiary.id)}
  entryToEdit={selectedEntry}
  initialReadOnly={!!selectedEntry}
  onBack={() => {
    setSelectedEntry(null);
    setCurrentView('entries');
  }}
  onSaved={() => {
    setSelectedEntry(null);
    loadEntriesForDiary(selectedDiary.id);
    loadDiaries();
    setCurrentView('entries');
  }}
  />
  );
}
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.header}>
            <GreetingHeader name="Alex" />
            <DatePill />
          </View>
          <FlatList
            data={diaries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DiaryCard
                diary={item}
                onPress={() => {
                  setSelectedDiary(item);
                  loadEntriesForDiary(item.id);
                  setCurrentView('entries');
                  slideInEntries();
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
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.navBar}>
              <TouchableOpacity
                onPress={() => {
                  slideOutEntries(() => {
                    setSelectedDiary(null);
                    loadDiaries();
                    setCurrentView('diaries');
                  });
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.backButtonText}>← {selectedDiary.name}</Text>
              </TouchableOpacity>
            </View>

            <EntriesList
              entries={entries}
              onNewEntry={() => {
                setSelectedEntry(null);
                setCurrentView('editor');
              }}
              onSelectEntry={(entry) => {
                setSelectedEntry(entry);
                setCurrentView('editor');
              }}
              onDeleteEntry={handleDeleteEntry}
            />
          </SafeAreaView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  navBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B4938",
  },
  fullScreenSlide: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#F8FAF9",
    zIndex: 10,
  },
});
