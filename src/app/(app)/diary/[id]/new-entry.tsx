import Editor from "@/src/components/Editor";
import {
  createEntryWithMedia,
  PendingAttachment,
} from "@/src/services/attachments";
import { toDateKey } from "@/src/utils/dates";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewEntryScreen() {
  const { id, date } = useLocalSearchParams();
  const diaryId = Number(id);
  const rawDate = Array.isArray(date) ? date[0] : date;
  const entryDate = rawDate ?? toDateKey(new Date());
  const router = useRouter();

  const handleSave = async (
    title: string,
    entryDate: string,
    body: string,
    media: { added: PendingAttachment[]; removedIds: number[] },
  ) => {
    try {
      await createEntryWithMedia(diaryId, title, entryDate, body, media.added);
      router.back();
    } catch (e) {
      console.error("Save failed:", e);
      Alert.alert(
        "Couldn't save",
        e instanceof Error ? e.message : "Please try again.",
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Editor
        initialDate={entryDate}
        initialReadOnly={false}
        onSave={handleSave}
        onBack={() => {
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
