import { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, useColorScheme, View } from "react-native";
import { signIn, signUp, subscribeToAuthState } from "../utils/auth";
import { ensureDefaultDiary, getEntriesByDiaryId, initDatabase, JournalEntry } from '../utils/db';
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

    const [currentScreen, setCurrentScreen] = useState<'list' | 'editor'>('list');
    const [selectedDiaryId, setSelectedDiaryId] = useState<number | null>(null);
    useEffect(() => {
    initDatabase();
    const defaultDiaryId = ensureDefaultDiary();
    setSelectedDiaryId(defaultDiaryId);
  }, []);

const loadEntries = useCallback(() => {
    if (selectedDiaryId === null) return;
    const data = getEntriesByDiaryId(selectedDiaryId);
    setEntries(data);
  }, [selectedDiaryId]);
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

useEffect(() => {
    initDatabase();
    const unsubscribe = subscribeToAuthState((newSession) => {
        setSession(newSession);
    });
    return() => {
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
  if (currentScreen === 'editor' && selectedDiaryId !== null) {
    return (
      <Editor
        key={selectedEntry ? `entry-${selectedEntry.id}` : 'new-entry'}
        diaryId={selectedEntry ? selectedEntry.diary_id : selectedDiaryId}
        entryToEdit={selectedEntry}
        initialReadOnly={!!selectedEntry}
        onBack={() => {
          setSelectedEntry(null);
          setCurrentScreen('list');
        }}
        onSaved={() => {
          setSelectedEntry(null);
          loadEntries();
          setCurrentScreen('list');
        }}
      />
    );
  }

        return (
            <EntriesList
            entries={entries}
                onNewEntry={() => {
                    setSelectedEntry(null);
                    setCurrentScreen('editor');
                }}
                onSelectEntry={(entry) => {
                    setSelectedEntry(entry);
                    setCurrentScreen('editor');
                }}
            />
        );
    }
    return (
        <View style={styles.container}>

            <Text style={styles.header}> Get Started</Text>

            <TextInput
                style={styles.input}
                placeholder="johndoe@example.com"
                value={email}
                autoCapitalize="none"
                onChangeText={(text) => setEmail(text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                autoCapitalize="none"
                secureTextEntry
                onChangeText={(text) => setPassword(text)}
            />
            <Button title="Sign In" disabled={loading} onPress={signInWithEmail} />
            <View style={{ height: 10 }} />
            <Button title="Sign Up" disabled={loading} onPress={signUpWithEmail} />
        </View>
    )
}
const getStyles = (isDark: boolean) => StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    header: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: isDark ? '#fff' : '#000' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 20, borderRadius: 8, marginBottom: 20, color: isDark ? '#fff' : '#000' }
});
