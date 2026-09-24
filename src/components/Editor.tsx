import {
  CoreBridge,
  darkEditorCss,
  darkEditorTheme,
  RichText,
  TenTapStartKit,
  Toolbar,
  useEditorBridge,
} from "@10play/tentap-editor";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { saveEntry } from "../db/entries";
import Button from "./Button";

type Entry = { title: string; description: string; createdAt: string };

interface EditorProps {
  diaryId: number;
  onSaved?: () => void;
  onBack?: () => void;
  entryToEdit?: Entry | null;
  initialReadOnly?: boolean;
}

export default function Editor({
  diaryId,
  onSaved,
  onBack,
  entryToEdit,
  initialReadOnly = false,
}: EditorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getStyles(isDark);

  const [isReadOnly, setIsReadOnly] = useState(initialReadOnly);
  const [title, setTitle] = useState(entryToEdit ? entryToEdit.title : "");

  const editor = useEditorBridge({
    autofocus: !initialReadOnly,
    avoidIosKeyboard: true,
    initialContent: entryToEdit ? entryToEdit.body : "<p></p>",
    editable: !isReadOnly,
    bridgeExtensions: isDark
      ? [...TenTapStartKit, CoreBridge.configureCSS(darkEditorCss)]
      : TenTapStartKit,
    theme: isDark ? darkEditorTheme : undefined,
  });

  const displayDate = new Date(
    entryToEdit ? entryToEdit.createdAt : new Date(),
  ).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleSave = async () => {
    const contentHtml = await editor.getHTML();
    await saveEntry(diaryId, title, contentHtml);
    if (onSaved) onSaved();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={20} />
        </TouchableOpacity>
        <Text style={styles.newJournalText}>Add new Journal</Text>
        <Button
          label="Save"
          onPress={handleSave}
          size="sm"
          style={{ width: "auto" }}
        />
      </View>

      <View style={styles.bodyContainer}>
        <TextInput
          style={styles.titleInput}
          placeholder="Entry Title..."
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
          editable={!isReadOnly}
        />

        <Text style={styles.dateSubtitle}>{displayDate}</Text>

        <RichText editor={editor} style={styles.editor} />
      </View>

      <KeyboardAvoidingView behavior={"padding"} style={styles.footer}>
        <View style={styles.toolbarContainer}>
          <Toolbar editor={editor} hidden={false} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#111715" : "#F8FAF9",
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#283934" : "#E5EBE8",
      backgroundColor: isDark ? "#111715" : "#F8FAF9",
    },
    backBtn: {
      paddingVertical: 4,
      paddingHorizontal: 6,
    },
    newJournalText: {
      fontSize: 18,
      fontWeight: "700",
      color: isDark ? "#ECF2EF" : "#18201E",
    },
    saveBtn: {
      backgroundColor: isDark ? "#4E9E80" : "#1B4938",
      paddingVertical: 8,
      paddingHorizontal: 18,
      borderRadius: 20,
    },
    saveBtnText: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "700",
    },
    bodyContainer: {
      flex: 1,
      backgroundColor: isDark ? "#111715" : "#F8FAF9",
    },
    titleInput: {
      fontSize: 26,
      fontWeight: "700",
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 4,
      color: isDark ? "#ECF2EF" : "#18201E",
    },
    dateSubtitle: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#8EA39C" : "#62726E",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      paddingHorizontal: 20,
      paddingBottom: 14,
    },
    editor: {
      flex: 1,
      backgroundColor: isDark ? "#111715" : "#F8FAF9",
      marginHorizontal: 20,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: isDark ? "#283934" : "#E5EBE8",
      backgroundColor: isDark ? "#18221F" : "#ffffff",
    },
    toolbarContainer: {
      height: 50,
      minHeight: 48,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#283934" : "#E5EBE8",
      backgroundColor: isDark ? "#18221F" : "#ffffff",
      justifyContent: "center",
    },
  });
