import { Attachment } from "@/src/utils/db";
import {
  CoreBridge,
  darkEditorTheme,
  RichText,
  TenTapStartKit,
  Toolbar,
  useEditorBridge,
} from "@10play/tentap-editor";
import { useState } from "react";
import { Keyboard, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import useTheme from "../hooks/useTheme";
import { PendingAttachment, pickAudio, pickMedia, resolveAttachmentUri } from "../services/attachments";
import AttachMenu from "./AttachMenu";
import AudioRow from "./AudioRow";
import Button from "./Button";
import MediaThumb from "./MediaThumb";
import MediaViewer, { Rect, ViewerItem } from "./MediaViewer";
import { IconButton } from "./PressableScale";
import VoiceRecorder from "./VoiceRecorder";

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
  const [viewing, setViewing] = useState<{key: string; item: ViewerItem; origin: Rect } | null>(null);
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [existing, setExisting] = useState<Attachment[]>(initialAttachments ?? []);
  const [added, setAdded] = useState<PendingAttachment[]>([]);
  const [removedIds, setRemovedIds] = useState<number[]>([]);


  const handleAddAudio = async () => {
    const picked = await pickAudio();
    if (picked.length) setAdded((prev) => [...prev, ...picked]);
  };

  const openRecorder = () => {
    Keyboard.dismiss();
    editor.blur();
    setRecorderOpen(true);
  };

  const handleRecorded = (rec: PendingAttachment) => {
    setAdded((prev) => [...prev, rec]);
    setRecorderOpen(false);
  }

  const handleAddMedia = async () => {
    const picked = await pickMedia();
    if (picked.length) setAdded((prev) => [...prev, ...picked]);
  };

  const thumbs = [
    ...existing.map((a) => ({
      key: `e${a.id}`, uri: resolveAttachmentUri(a.rel_path), kind: a.kind, name: a.name ?? "Audio",
      width: a.width, height: a.height, durationMs: a.duration_ms,
      remove: () => {
        setExisting((p) => p.filter((x) => x.id !== a.id));
        setRemovedIds((p) => [...p, a.id]);
      },
    })),
    ...added.map((a) => ({
      key: `n${a.uri}`, uri: a.uri, kind: a.kind, name: a.name ?? "Audio",
      width: a.width, height: a.height, durationMs: a.durationMs,
      remove: () => setAdded((p) => p.filter((x) => x.uri !== a.uri)),
    })),
  ];

  const visual = thumbs.filter((t) => t.kind !== "audio");
  const audio = thumbs.filter((t) => t.kind === "audio");

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
  <View style={styles.leftHeaderGroup}>
    <IconButton icon="arrow-back" label="Go back" onPress={() => onBack?.()} color={colors.text} />
      <Text accessibilityRole="header" style={styles.newJournalText} numberOfLines={1}>
        {initialTitle ? (isReadOnly ? "Journal Entry" : "Edit Journal") : "New Journal"}
      </Text>
  </View>
  {!isReadOnly && (
    <>
    <AttachMenu
    actions={[
      { key: "media", icon: "images-outline", label: "Photo or video", onPress: handleAddMedia},
      {key: "audio", icon: "musical-note-outline", label: "Audio file", onPress: handleAddAudio},
      { key: "voice", icon: "mic-outline", label: "Record voice note", onPress: openRecorder},
    ]}
    />
    <Button label="Save" onPress={handleSave} size="sm" style={{width: 72}} />
    </>
  )}
</View>

      <View style={styles.bodyContainer}>
        <TextInput
        accessibilityLabel="Entry title"
          style={styles.titleInput}
          placeholder="Entry Title..."
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          editable={!isReadOnly}
        />

        <Text style={styles.dateSubtitle}>{displayDate}</Text>
        {visual.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaStrip} contentContainerStyle={styles.mediaStripContent}>
            {visual.map((t) => (
              <MediaThumb
              key={t.key}
              uri={t.uri}
              kind={t.kind as "image" | "video"}
              label={t.kind === "image" ? "Photo" : "Video"}
              hidden={viewing?.key === t.key}
              onOpen={(origin) =>
                setViewing({ key: t.key, origin, item: { uri: t.uri, kind: t.kind as "image" | "video", width: t.width, height: t.height }})
              }
              onRemove={isReadOnly ? undefined : t.remove}
              />
            ))}
          </ScrollView>
        )}
        {audio.map((t) => (
          <AudioRow key={t.key} uri={t.uri} name={t.name} durationMs={t.durationMs} onRemove={isReadOnly ? undefined : t.remove} />
        ))}
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
        <MediaViewer item={viewing?.item ?? null} origin={viewing?.origin ?? null} onClose={() => setViewing(null)} />
          {recorderOpen && <VoiceRecorder onDone={handleRecorded} onCancel={() => setRecorderOpen(false)} />}
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
      paddingVertical: 6,
      paddingHorizontal: 8,
      gap: 4,
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
      gap: 4,
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
