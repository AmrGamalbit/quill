import Editor from "@/src/components/Editor";
import { saveEntry } from "@/src/utils/db";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewEntryScreen() {
  const { id } = useLocalSearchParams();
  const diaryId = Number(id);
  const router = useRouter();

  const handleSave = (title: string, body: string) => {
    saveEntry(diaryId, title, body);
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
