import Editor from "@/src/components/Editor";
import { getEntryById, saveEntry } from "@/src/db/entries";
import { Entry } from "@/src/types/entry";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EntryEditScreen() {
  const { id, entryId } = useLocalSearchParams();
  const [entry, setEntry] = useState<Entry>();
  const diaryId = Number(id);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEntry = async () => {
      setLoading(true);
      const result = await getEntryById(Number(entryId));
      setEntry(result);
      setLoading(false);
    };
    loadEntry();
  }, [entryId]);

  const handleSave = (title: string, body: string) => {
    saveEntry(diaryId, title, body);
    router.back();
  };

  if (loading) {
    return <SafeAreaView style={{ flex: 1 }} />; // or a spinner
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Editor
        initialTitle={entry?.title}
        initialBody={entry?.body}
        initialDate={entry?.createdAt}
        initialReadOnly={true}
        onSave={(title, body) => handleSave(title, body)}
        onBack={() => {
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
