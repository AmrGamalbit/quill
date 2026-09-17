import { RichText, Toolbar, useEditorBridge } from '@10play/tentap-editor';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveEntry } from './utils/db';

interface EditorProps {
    onSaved?: () => void;
}

export default function Editor({onSaved}: EditorProps) {
        const colorScheme = useColorScheme();
        const isDark = colorScheme === "dark";
        const styles = getStyles(isDark);

    const [title, setTitle] = useState('');
    const editor = useEditorBridge({
        autofocus: false,
        avoidIosKeyboard: true,
        initialContent: "",
    })

const handleSave = async () => {
    if (!title.trim()) {
        Alert.alert('Missing Title', 'Please enter a title for your entry.')
        return;
    }

    const contentHtml = await editor.getHTML();
    saveEntry(title, contentHtml);
    Alert.alert('Saved!', 'Entry saved succesfully.');
    if (onSaved) onSaved();
}
return (
    <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
            <Text style={styles.dateLabel}>
                {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })}
            </Text>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
        </View>

        <TextInput
        style={styles.titleInput}
        placeholder='Entry Title'
        placeholderTextColor={'#9ca3af'}
        value={title}
        onChangeText={setTitle}
        />
        <View style={styles.editorContainer}>
            <RichText editor={editor} style={styles.editor}/>
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
        borderBottomColor: '#f0ede6',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    titleInput: {
        fontSize: 20,
        fontWeight: 700,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomColor: '#1c1917',
    },
    editor: {
        flex: 1,
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
    }
});