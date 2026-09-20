import { RichText, Toolbar, useEditorBridge } from "@10play/tentap-editor";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { JournalEntry, saveEntry } from "../utils/db";

interface EditorProps {
  diaryId: number;
  onSaved?: () => void;
  onBack?: () => void;
  entryToEdit?: JournalEntry | null;
  initialReadOnly?: boolean;
}

export default async function Editor({
  diaryId,
  onSaved,
  onBack,
  entryToEdit,
  initialReadOnly = false,
}: EditorProps) {
  const { colors } = useTheme();

  const [isReadOnly, setIsReadOnly] = useState(initialReadOnly);
  const [title, setTitle] = useState(entryToEdit ? entryToEdit.title : "");
  const editor = useEditorBridge({
    autofocus: !initialReadOnly,
    avoidIosKeyboard: true,
    initialContent: entryToEdit ? entryToEdit.body : "<p></p>",
    editable: !isReadOnly,
  });
  const router = useRouter();
  const displayDate = new Date(
    entryToEdit ? entryToEdit.created_at : Date.now(),
  ).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const contentHtml = await editor.getHTML();
  saveEntry(diaryId, title, contentHtml);
  router.back();
  if (onSaved) onSaved();

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Top Navigation Bar: Back on the left, Save on the right */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <SymbolView name="chevron.backward" size={20} />
        </TouchableOpacity>
        <Text style={styles.newJournalText}>Add new Journal</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Main Content Area */}
      <View style={styles.bodyContainer}>
        {/* Title Input */}
        <TextInput
          style={styles.titleInput}
          placeholder="Entry Title..."
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
          editable={!isReadOnly}
        />

        {/* Date Displayed Directly Under the Title */}
        <Text style={styles.dateSubtitle}>{displayDate}</Text>

        {/* Rich Text Editor */}
        <RichText
          editor={editor}
          style={[styles.editor, { backgroundColor: colors.background }]}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
        style={styles.footer}
      >
        <View style={styles.toolbarContainer}>
          <Toolbar editor={editor} hidden={false} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
