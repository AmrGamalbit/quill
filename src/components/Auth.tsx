import { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { FlatList } from "react-native-reanimated/lib/typescript/Animated";
import { signIn, signUp, subscribeToAuthState } from "../utils/auth";
import {
  Diary as DbDiary,
  getAllDiaries,
  getEntriesByDiaryId,
  initDatabase,
  JournalEntry
} from "../utils/db";
import DiaryCard from "./DiaryCard";
import Editor from "./Editor";
import EntriesList from "./EntriesList";

export default function Auth() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);


  const styles = getStyles(isDark);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  const [currentScreen, setCurrentScreen] = useState<'diaries' | 'entries' | 'editor'>('diaries');
  const [diaries, setDiaries] = useState<DbDiary[]>([]);
  const [selectedDiary, setSelectedDiary] = useState<DbDiary | null>(null);
  const [selectedDiaryId, setSelectedDiaryId] = useState<number | null>(null);

  const loadDiaries = useCallback(() => {
    const all = getAllDiaries();
    setDiaries(all);
  }, []);

  useEffect(() => {
    initDatabase();
    loadDiaries();
  }, [loadDiaries]);


  const loadEntries = useCallback(() => {
    if (selectedDiaryId === null) return;
    const data = getEntriesByDiaryId(selectedDiaryId);
    setEntries(data);
  }, [selectedDiaryId]);
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((newSession) => {
      setSession(newSession);
    });
    return () => {
      unsubscribe();
    }
  }, []);
  async function signInWithEmail() {
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      Alert.alert('Login error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }
  async function signUpWithEmail() {
    setLoading(true);
    try {
      const { session } = await signUp(email, password);
      if (!session) {
        Alert.alert('Check your inbox', 'Click the link we sent to finish signing up.');
      }
    } catch (err: any) {
      Alert.alert('Sign up error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }
if (session && session.user) {
  // Screen 3: Writing or Editing an Entry
  if (currentScreen === "editor" && selectedDiary) {
    return (
      <Editor
        key={selectedEntry ? `entry-${selectedEntry.id}` : "new-entry"}
        diaryId={selectedDiary.id}
        entryToEdit={selectedEntry}
        initialReadOnly={!!selectedEntry}
        onBack={() => {
          setSelectedEntry(null);
          setCurrentScreen("entries");
        }}
        onSaved={() => {
          setSelectedEntry(null);
          if (selectedDiary) {
            setEntries(getEntriesByDiaryId(selectedDiary.id));
          }
          setCurrentScreen("entries");
        }}
      />
    );
  }

  // Screen 2: Looking at all entries inside the clicked diary
  if (currentScreen === "entries" && selectedDiary) {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.backToDiariesBtn}
          onPress={() => {
            setSelectedDiary(null);
            loadDiaries();
            setCurrentScreen("diaries");
          }}
        >
          <Text style={styles.backToDiariesText}>← All Diaries</Text>
        </TouchableOpacity>

        <EntriesList
          entries={entries}
          onNewEntry={() => {
            setSelectedEntry(null);
            setCurrentScreen("editor");
          }}
          onSelectEntry={(entry) => {
            setSelectedEntry(entry);
            setCurrentScreen("editor");
          }}
        />
      </View>
    );
  }

  // Screen 1: Top-level Diaries List
  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Diaries</Text>
      <FlatList
        data={diaries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DiaryCard
            diary={{
              id: item.id.toString(),
              name: item.name,
              createdAt: item.created_at,
              entries: getEntriesByDiaryId(item.id).map((e) => ({
                id: e.id.toString(),
                title: e.title,
                author: "You",
                body: e.body,
                createdAt: e.created_at,
              })),
              members: ["You"],
              lastOpenedAt: new Date().toISOString(),
            }}
            onPress={() => {
              setSelectedDiary(item);
              setEntries(getEntriesByDiaryId(item.id));
              setCurrentScreen("entries");
            }}
            onDelete={(id) => {
              loadDiaries();
            }}
          />
        )}
      />
    </View>
  );
}
}
const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 50,
      paddingHorizontal: 20,
      backgroundColor: isDark ? "#111715" : "#F8FAF9",
    },
    header: {
      fontSize: 26,
      fontWeight: "bold",
      marginBottom: 16,
      color: isDark ? "#ECF2EF" : "#18201E",
    },
    backToDiariesBtn: {
      paddingTop: 50,
      paddingHorizontal: 16,
      paddingBottom: 10,
      backgroundColor: isDark ? "#121212" : "#fafaf9",
    },
    backToDiariesText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1B4938",
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      padding: 16,
      borderRadius: 8,
      marginBottom: 16,
      color: isDark ? "#fff" : "#000",
    },
  });