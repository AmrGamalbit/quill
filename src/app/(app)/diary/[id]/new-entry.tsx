import Editor from "@/src/components/Editor";
import { createEntryWithMedia, PendingAttachment } from "@/src/services/attachments";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewEntryScreen() {
  const { id } = useLocalSearchParams();
  const diaryId = Number(id);
  const router = useRouter();

  const handleSave = async (
    title: string,
    body: string,
    media: {added: PendingAttachment[]; removedIds: number[] },
  ) => {
    try {
      await createEntryWithMedia(diaryId, title, body, media.added);
      router.back();
    } catch {
      Alert.alert("Couldn't save", "The media couldn't be stored. Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Editor
        initialReadOnly={false}
        onSave={handleSave}
        onBack={() => {
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
