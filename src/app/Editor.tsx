import { RichText, Toolbar, useEditorBridge } from '@10play/tentap-editor';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { JournalEntry, saveEntry } from '../utils/db';

interface EditorProps {
    diaryId: number;
    onSaved?: () => void;
    onBack?: () => void;
    entryToEdit?: JournalEntry | null;
    initialReadOnly?: boolean;
}

export default function Editor({ diaryId, onSaved, onBack, entryToEdit, initialReadOnly = false }: EditorProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const styles = getStyles(isDark);

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
    })

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Missing Title', 'Please enter a title for your entry.')
            return;
        }

        const contentHtml = await editor.getHTML();
        saveEntry(diaryId, title, contentHtml);
        Alert.alert('Saved!', 'Entry saved succesfully.');
        if (onSaved) onSaved();
    }
    return (
    <SafeAreaView style={styles.container}>
      {/* 1. Top Navigation Bar: Back on the left, Save on the right */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <SymbolView name="chevron.backward" size={20} tintColor={isDark ? '#fff' : '#1c1917'} />
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
        <RichText editor={editor} style={styles.editor} />
      </View>

        <KeyboardAvoidingView behavior={'padding'}
        style={styles.footer}>
            <View style={styles.toolbarContainer}>
            <Toolbar editor={editor} hidden={false}/>
            </View>

        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: (isDark) ? '#27272a' : '#f0ede6',
    },
    backBtn: {
      paddingVertical: 4,
      paddingHorizontal: 6,
    },
    backBtnText: {
      fontSize: 16,
      fontWeight: '600',
    },
    container: {
        flex: 1,
    },
    titleInput: {
        fontSize: 26,
      fontWeight: '700',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 4,
      color: isDark ? '#ffffff' : '#1c1917',
    },
    editor: {
        flex: 1,
        backgroundColor: isDark ? '#121212' : '#ffffff',
        marginHorizontal: 20,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#f8f8f8',
    },
    buttonWrapper: {
        padding: 10,
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: 600,
        color: '#78716c',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    saveBtn: {
        backgroundColor: '#1c1917',
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 700,
    },
    editorContainer: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: 'transparent',
    },
    toolbarContainer: {
        height: 50,
        minHeight: 48,
        borderTopWidth: 1,
        borderTopColor: '#e7e5e4',
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    dateSubtitle: {
      fontSize: 13,
      fontWeight: '600',
      color: '#a8a29e',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      paddingHorizontal: 20,
      paddingBottom: 14,
    },
    bodyContainer: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#ffffff',
    },
    newJournalText: {
        marginLeft: 0,
        fontSize: 18,
        fontWeight: 700,
    }
});