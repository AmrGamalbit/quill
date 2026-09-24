import Editor from "@/src/components/Editor";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
export default function NewEntryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Editor
        diaryId={Number(id)}
        entryToEdit={null}
        initialReadOnly={false}
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
