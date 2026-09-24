import Editor from "@/src/components/Editor";
import { getEntryById, saveEntry } from "@/src/db/entries";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function EntryEditScreen() {
  const { id, entryId } = useLocalSearchParams();
  const [entry, setEntry] = useState()
  const diaryId = Number(id);
  const entryToEdit = getEntryById(Number(entryId));
  const router = useRouter();

  const handleSave = (title: string, body: string) => {
    saveEntry(diaryId, title, body);
    router.back();
  };
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Editor
        initialTitle={entryToEdit?.title}
        initialBody={entryToEdit?.body}
        initialDate={entryToEdit?.created_at}
        initialReadOnly={true}
        onSave={(title, body) => handleSave(title, body)}
        onBack={() => {
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
