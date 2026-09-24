import Editor from "@/src/components/Editor";
import { getEntryById } from "@/src/db/entries";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EntryEditScreen() {
  const { id, entryId } = useLocalSearchParams();
  const [entry, setEntry] = useState(null);
  useEffect(() => {
    getEntryById(Number(entryId)).then((e) => setEntry(e));
  }, [entryId]);

  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {entry && (
        <Editor
          diaryId={Number(id)}
          entryToEdit={entry}
          initialReadOnly={!!entry}
          onBack={() => {
            router.back();
          }}
          onSaved={() => router.back()}
          // onSaved={() => {
          //   setSelectedEntry(null);
          //   loadEntriesForDiary(selectedDiary.id);
          //   loadDiaries();
          //   setCurrentView("entries");
          // }}
        />
      )}
      {!entry && <Text>There is no entry yet</Text>}
    </SafeAreaView>
  );
}
