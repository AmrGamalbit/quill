import Editor from "@/src/components/Editor";
import { PendingAttachment, updateEntryWithMedia } from "@/src/services/attachments";
import { getAttachmentsByEntryId, getEntryById } from "@/src/utils/db";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EntryEditScreen() {
  const {entryId} = useLocalSearchParams();
  const entryToEdit = getEntryById(Number(entryId));
  const [attachments]= useState(() => getAttachmentsByEntryId(Number(entryId)));
  const router = useRouter();

  const handleSave = async (
    title: string,
    body: string,
    media: {added: PendingAttachment[]; removedIds: number[]},
  ) => {
    try {
      await updateEntryWithMedia(Number(entryId), title, body, media);
      router.back();
    } catch {
      Alert.alert("Couldn't save", "The media couldn't be stored. Please try again.")
    }
  };
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Editor
      initialAttachments={attachments}
        initialTitle={entryToEdit?.title}
        initialBody={entryToEdit?.body}
        initialDate={entryToEdit?.created_at}
        initialReadOnly={true}
        onSave={handleSave}
        onBack={() => {
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
