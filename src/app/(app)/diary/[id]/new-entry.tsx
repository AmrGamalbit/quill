import Editor from "@/src/components/Editor";
import useEntries from "@/src/hooks/useEntries";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewEntryScreen() {
  const { id } = useLocalSearchParams();
  const diaryId = Number(id);
  const { addEntry } = useEntries(diaryId);
  const router = useRouter();

  const handleSave = async (title: string, body: string) => {
    await addEntry(title, body);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Editor
        initialReadOnly={false}
        onSave={(title, body) => handleSave(title, body)}
        onBack={() => {
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
