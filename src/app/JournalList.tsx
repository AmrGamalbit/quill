import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from '../components/Themed';
import { getAllEntries, initDatabase, JournalEntry } from './utils/db';

interface JournalListProps {
    onNewEntry: () => void;
    onSelectEntry?: (entry: JournalEntry) => void;
    onOpenSettings?: () => void;
}

export default function JournalList({onNewEntry, onSelectEntry, onOpenSettings}: JournalListProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const styles = getStyles(isDark);

    const [entries, setEntries] = useState<JournalEntry[]>([]);

    useEffect(() => {
        initDatabase();
        loadEntries();
    }, []);
    const loadEntries = () => {
        const data = getAllEntries();
        setEntries(data);
    }
    const renderItem = ({item} : {item : JournalEntry}) => (
        <TouchableOpacity 
        style={styles.card}
        onPress={() => onSelectEntry && onSelectEntry(item)}
        activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardDate}>
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                    })}
                </Text>
            </View>

            <Text style={styles.cardPreview} numberOfLines={2}>
                {item.content.replace(/<[^>]+>/g, '').trim() || 'No text content.'}
            </Text>
        </TouchableOpacity>
    )
    return(
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.heading}>My Journals</Text>
                <TouchableOpacity style={styles.iconBtn} onPress={onOpenSettings} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                    <Ionicons name='settings-outline' size={22} color={isDark ? '#fff' : '#1c1917'}/>
                </TouchableOpacity>
            </View>

            <FlatList 
            data={entries}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No journals written yet.</Text>
                </View>
            }
            />
            <TouchableOpacity style={styles.fab} onPress={onNewEntry} activeOpacity={0.8}>
                <Ionicons name='pencil' size={24} color='#ffffff'/>
            </TouchableOpacity>
        </SafeAreaView>
    )
}
const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#fafaf9',
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#27272a' : '#f0ede6',
    },
    heading: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#1c1917',
    },
    newBtn: {
      backgroundColor: isDark ? '#ffffff' : '#1c1917',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    newBtnText: {
      color: isDark ? '#121212' : '#ffffff',
      fontSize: 14,
      fontWeight: '700',
    },
    listContent: {
      padding: 16,
      paddingBottom: 100,
    },
    card: {
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#27272a' : '#e7e5e4',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#1c1917',
      flex: 1,
      marginRight: 8,
    },
    cardDate: {
      fontSize: 12,
      color: '#a8a29e',
      fontWeight: '500',
    },
    cardPreview: {
      fontSize: 14,
      color: isDark ? '#a1a1aa' : '#78716c',
      lineHeight: 20,
    },
    emptyContainer: {
      paddingTop: 60,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 15,
      color: '#a8a29e',
    },
    iconBtn: {
        padding: 6,
        borderRadius: 20,
    },
    fab:{
        position: 'absolute',
        right: 24,
        bottom: 30,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#1c1917',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4,},
        shadowOpacity: 0.3,
        shadowRadius: 4.5,
        elevation: 6,
    },
  });