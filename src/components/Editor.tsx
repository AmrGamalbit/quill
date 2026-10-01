import {
  CoreBridge,
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
  View
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import useTheme from "../hooks/useTheme";
import Button from "./Button";

interface EditorProps {
  initialTitle?: string;
  initialBody?: string;
  initialDate?: string;
  initialReadOnly?: boolean;
  onSave: (title: string, body: string) => void;
  onBack?: () => void;
}

export default function Editor({
  initialTitle,
  initialBody,
  initialDate,
  initialReadOnly,
  onSave,
  onBack,
}: EditorProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const { top } = useSafeAreaInsets();
  const keyboardVerticalOffset = top;

  const [isReadOnly, setIsReadOnly] = useState(initialReadOnly ?? false);
  const [title, setTitle] = useState(initialTitle ?? "");

  const dynamicEditorCss = `
    body {
      background-color: ${colors.background};
      color: ${colors.text};
      padding: 0px;
      margin: 0px;
    }
  `;

  const editor = useEditorBridge({
    autofocus: !initialReadOnly,
    avoidIosKeyboard: false,
    initialContent: initialBody ?? "<p></p>",
    editable: !isReadOnly,
    bridgeExtensions: [
      ...TenTapStartKit,
      CoreBridge.configureCSS(dynamicEditorCss),
    ],
    theme: isDark ? darkEditorTheme : undefined,
  });

  const displayDate = new Date(initialDate ?? Date.now()).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  const handleSave = async () => {
    const contentHtml = await editor.getHTML();
    onSave(title, contentHtml);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <View style={styles.topBar}>
        <View style={styles.leftHeaderGroup}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.newJournalText} numberOfLines={1}>
            {initialTitle
              ? isReadOnly
                ? "Journal Entry"
                : "Edit Journal"
              : "New Journal"}
          </Text>
        </View>
        {!isReadOnly && (
          <Button
            label="Save"
            onPress={handleSave}
            size="sm"
            style={{ width: 72 }}
          />
        )}
      </View>

      <View style={styles.bodyContainer}>
        <TextInput
          style={styles.titleInput}
          placeholder="Entry Title..."
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          editable={!isReadOnly}
        />

        <Text style={styles.dateSubtitle}>{displayDate}</Text>
        <RichText editor={editor} style={styles.editor} />
      </View>
      {!isReadOnly && (
        <KeyboardAvoidingView
          behavior={"padding"}
          style={styles.keyboardToolbarContainer}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <Toolbar editor={editor} />
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    backBtn: {
      paddingVertical: 4,
      paddingHorizontal: 6,
    },
    newJournalText: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    bodyContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    titleInput: {
      fontSize: 26,
      fontWeight: "700",
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 4,
      color: colors.text,
    },
    dateSubtitle: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      paddingHorizontal: 20,
      paddingBottom: 14,
    },
    editor: {
      flex: 1,
      backgroundColor: colors.background,
      marginHorizontal: 20,
    },
    keyboardToolbarContainer: {
      position: "absolute",
      width: "100%",
      bottom: 0,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    leftHeaderGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
      marginRight: 12,
    },
  });
