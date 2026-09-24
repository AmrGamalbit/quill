import Editor from "@/src/components/Editor";
import { getEntriesByDiaryId } from "@/src/db/entries";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function EntryEditScreen() {
  const { id, entryId } = useLocalSearchParams();
  const [entry, setEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntry = async () => {
      setIsLoading(true);
      console.log(entryId);
      const fetchedEntry = await getEntriesByDiaryId(id);
      console.log(fetchedEntry);
      setEntry(fetchedEntry);
      setIsLoading(false);
    };
    fetchEntry();
  }, [entryId]);

  const router = useRouter();

  if (isLoading) {
    return <Text>Wait</Text>;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
    </SafeAreaView>
  );
}
