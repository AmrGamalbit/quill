import { CoreBridge, darkEditorCss, darkEditorTheme, RichText, TenTapStartKit, Toolbar, useEditorBridge } from '@10play/tentap-editor';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { JournalEntry, saveEntry } from '../utils/db';

interface EditorProps {
  diaryId: number;
  onSaved?: () => void;
  onBack?: () => void;
  entryToEdit?: JournalEntry | null;
  initialReadOnly?: boolean;
}

export default function Editor({
  diaryId,
  onSaved,
  onBack,
  entryToEdit,
  initialReadOnly = false,
}: EditorProps) {
  const { colors } = useTheme();
  const displayDate = new Date(
    entryToEdit ? entryToEdit.created_at : Date.now(),
  ).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
        entryToEdit ? entryToEdit.created_at : Date.now()
    ).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    const [isReadOnly, setIsReadOnly] = useState(initialReadOnly);
    const [title, setTitle] = useState(entryToEdit ? entryToEdit.title : '');

      const editor = useEditorBridge({
        autofocus: !initialReadOnly,
        avoidIosKeyboard: true,
        initialContent: entryToEdit ? entryToEdit.body : '<p></p>',
        editable: !isReadOnly,
        bridgeExtensions: isDark ? [
          ...TenTapStartKit,
          CoreBridge.configureCSS(darkEditorCss),
        ] : TenTapStartKit,
        theme: isDark? darkEditorTheme : undefined,
    });

    const contentHtml = await editor.getHTML();
    saveEntry(diaryId, title, contentHtml);
    router.back();
    if (onSaved) onSaved();
  };

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
            <Toolbar editor={editor} hidden={false}/>
            </View>

        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDark ? '#111715' : '#F8FAF9',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#283934' : '#E5EBE8',
        backgroundColor: isDark ? '#111715' : '#F8FAF9',
    },
    backBtn: {
        paddingVertical: 4,
        paddingHorizontal: 6,
    },
    newJournalText: {
        fontSize: 18,
        fontWeight: '700',
        color: isDark ? '#ECF2EF' : '#18201E',
    },
    saveBtn: {
        backgroundColor: isDark ? '#4E9E80' : '#1B4938',
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
    },
    saveBtnText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
    bodyContainer: {
        flex: 1,
        backgroundColor: isDark ? '#111715' : '#F8FAF9',
    },
    titleInput: {
        fontSize: 26,
        fontWeight: '700',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 4,
        color: isDark ? '#ECF2EF' : '#18201E',
    },
    dateSubtitle: {
        fontSize: 13,
        fontWeight: '600',
        color: isDark ? '#8EA39C' : '#62726E',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingHorizontal: 20,
        paddingBottom: 14,
    },
    editor: {
        flex: 1,
        backgroundColor: isDark ? '#111715' : '#F8FAF9',
        marginHorizontal: 20,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: isDark ? '#283934' : '#E5EBE8',
        backgroundColor: isDark ? '#18221F' : '#ffffff',
    },
    toolbarContainer: {
        height: 50,
        minHeight: 48,
        borderTopWidth: 1,
        borderTopColor: isDark ? '#283934' : '#E5EBE8',
        backgroundColor: isDark ? '#18221F' : '#ffffff',
        justifyContent: 'center',
    },
});
