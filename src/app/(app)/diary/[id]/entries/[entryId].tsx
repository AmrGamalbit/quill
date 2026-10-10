import { dialog } from "@/src/components/Dialog/DialogProvider";
import Editor from "@/src/components/Editor";
import { getAttachmentsByEntryId } from "@/src/db/attachments";
import { getEntryById } from "@/src/db/entries";
import {
  PendingAttachment,
  updateEntryWithMedia,
} from "@/src/services/attachments";
import { Attachment } from "@/src/types/attachment";
import { Entry } from "@/src/types/entry";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EntryEditScreen() {
  const { entryId } = useLocalSearchParams();
  const [entry, setEntry] = useState<Entry | null>();
  const [attachments, setAttachments] = useState<Attachment[]>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEntry = async () => {
      setLoading(true);
      const loadedEntry = await getEntryById(Number(entryId));
      const loadedAttachments = await getAttachmentsByEntryId(Number(entryId));
      setEntry(loadedEntry);
      setAttachments(loadedAttachments);
      setLoading(false);
    };
    loadEntry();
  }, [entryId]);

  const handleSave = async (
    title: string,
    body: string,
    media: { added: PendingAttachment[]; removedIds: number[] },
  ) => {
    try {
      await updateEntryWithMedia(Number(entryId), title, body, media);
      router.back();
    } catch {
      dialog.alert(
        "Couldn't save",
        "The media couldn't be stored. Please try again.",
      );
    }
  };

  if (loading) {
    return <SafeAreaView style={{ flex: 1 }} />; // or a spinner
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Editor
        initialAttachments={attachments}
        initialTitle={entry?.title}
        initialBody={entry?.body ?? undefined}
        initialDate={entry?.createdAt ?? undefined}
        initialReadOnly={true}
        onSave={handleSave}
        onBack={() => {
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
