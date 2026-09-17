import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { getAllEntries, initDatabase, JournalEntry } from './utils/db';

interface JournalListProps {
    onNewEntry: () => void;
    onSelectEntry?: (entry: JournalEntry) => void;
}

export default function journalList({onNewEntry, onSelectEntry}: JournalListProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
   // const styles = getStyles(isDark);

    const [entries, setEntries] = useState<JournalEntry[]>([]);

    useEffect(() => {
        initDatabase();
        loadEntries();
    }, []);
    const loadEntries = () => {
        const data = getAllEntries();
        setEntries(data);
    }
}