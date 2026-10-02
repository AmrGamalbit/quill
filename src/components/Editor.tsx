import { Attachment } from "@/src/utils/db";
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
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import useTheme from "../hooks/useTheme";
import { PendingAttachment, pickMedia, resolveAttachmentUri } from "../services/attachments";
import Button from "./Button";
import MediaViewer, { ViewerItem } from "./MediaViewer";

interface EditorProps {
  initialTitle?: string;
  initialBody?: string;
  initialDate?: string;
  initialReadOnly?: boolean;
  initialAttachments?: Attachment[];
  onSave: (
    title: string,
    body: string,
    media: {added: PendingAttachment[]; removedIds: number[]},
  ) => void;
  onBack?: () => void;
}

export default function Editor({
  initialTitle,
  initialBody,
  initialDate,
  initialReadOnly,
  initialAttachments,
  onSave,
  onBack,
}: EditorProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const { top } = useSafeAreaInsets();
  const keyboardVerticalOffset = top;

  const [isReadOnly, setIsReadOnly] = useState(initialReadOnly ?? false);
  const [title, setTitle] = useState(initialTitle ?? "");
  const [viewing, setViewing] = useState<ViewerItem | null>(null);
  const [existing, setExisting] = useState<Attachment[]>(initialAttachments ?? []);
  const [added, setAdded] = useState<PendingAttachment[]>([]);
  const [removedIds, setRemovedIds] = useState<number[]>([]);

  const handleAddMedia = async () => {
    const picked = await pickMedia();
    if (picked.length) setAdded((prev) => [...prev, ...picked]);
  };

  const thumbs = [
    ...existing.map((a) => ({
      key: `e${a.id}`, uri: resolveAttachmentUri(a.rel_path), kind: a.kind,
      remove: () => {
        setExisting((p) => p.filter((x) => x.id !== a.id));
        setRemovedIds((p) => [...p, a.id]);
      },
    })),
    ...added.map((a, i) => ({
      key: `n${i}`, uri: a.uri, kind: a.kind,
      remove: () => setAdded((p) => p.filter((_, j) => j !== i)),
    })),
  ];

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
    onSave(title, contentHtml, {added, removedIds});
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <View style={styles.topBar}>
        {!isReadOnly && (
          <TouchableOpacity
      style={{marginLeft: "auto", paddingHorizontal: 10}}
      onPress={handleAddMedia}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Ionicons name="attach" size={24} color={colors.text} />
    </TouchableOpacity>
        )}
  <View style={styles.leftHeaderGroup}>
    <TouchableOpacity
      style={styles.backBtn}
      onPress={onBack}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Ionicons name="arrow-back" size={22} color={colors.text} />
    </TouchableOpacity>
    <Text style={styles.newJournalText} numberOfLines={1}>
      {initialTitle ? (isReadOnly ? "Journal Entry" : "Edit Journal") : "New Journal"}
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
        {thumbs.length > 0 && (
          <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.mediaStrip}
          contentContainerStyle={styles.mediaStripContent}
          >
            {thumbs.map((t) => (
              <View key={t.key} style={styles.thumb}>
                <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setViewing({uri: t.uri, kind: t.kind})}
                >
                {t.kind === "image" ? (
                 <Image source={{uri: t.uri}} style={styles.thumbImg} /> 
                ):(
                  <View style={[styles.thumbImg, styles.videoPlaceholder]}>
                    <Ionicons name="play-circle" size={32} color={colors.textMuted} />
                    </View>
                )}
                </TouchableOpacity>
                {!isReadOnly && (
                  <TouchableOpacity style={styles.thumbRemove} onPress={t.remove}>
                    <Ionicons name="close" size={14} color={colors.text}/>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        )}
        <RichText editor={editor} style={styles.editor} />
      </View>
      {!isReadOnly && (
        <KeyboardAvoidingView
    behavior={'padding'}
    style={styles.keyboardToolbarContainer}
    keyboardVerticalOffset={keyboardVerticalOffset}
  >
    <Toolbar editor={editor} />
  </KeyboardAvoidingView>
        )}
        <MediaViewer item={viewing} onClose={() => setViewing(null)} />
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
      position: 'absolute',
      width: '100%',
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
    mediaStrip: {
      flexGrow: 0,
      marginBottom: 12,
    },
    mediaStripContent: {
      paddingHorizontal: 20,
      gap: 10
    },
    thumb: {
      width: 84,
      height: 84
    },
    thumbImg: {
      width: 84,
      height: 84,
      borderRadius: 10
    },
    videoPlaceholder: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    thumbRemove: {
      position: "absolute", top: 4, right: 4,
      width: 22, height: 22, borderRadius: 11,
      backgroundColor: colors.surface,
      alignItems: "center", justifyContent: "center",
    }
  });
