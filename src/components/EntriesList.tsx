import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { JournalEntry } from "../utils/db";

interface EntriesListProps {
  entries: JournalEntry[];
  onNewEntry: () => void;
  onSelectEntry?: (entry: JournalEntry) => void;
  onOpenSettings?: () => void;
  onDeleteEntry?: (id: number) => void;
}

export default function EntriesList({
  entries,
  onNewEntry,
  onSelectEntry,
  onOpenSettings,
  onDeleteEntry,
}: EntriesListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getStyles(isDark);

  const handleLongPress = (entry: JournalEntry) => {
    if (!onDeleteEntry) return;

    Alert.alert(
      "Delete Entry",
      `Are you sure you want to delete "${entry.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDeleteEntry(entry.id),
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: JournalEntry }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onSelectEntry && onSelectEntry(item)}
      activeOpacity={0.7}
      delayLongPress={500}
      onLongPress={() => handleLongPress(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardDate}>
          {new Date(item.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>

      <Text style={styles.cardPreview} numberOfLines={2}>
        {item.body.replace(/<[^>]+>/g, "").trim() || "Empty entry."}
      </Text>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No entries yet. Tap the pencil to start writing.
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={onNewEntry}
        activeOpacity={0.8}
      >
        <Ionicons name="pencil" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}
const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#111715" : "#F8FAF9",
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 100,
    },
    card: {
      backgroundColor: isDark ? "#1E2A27" : "#FFFFFF",
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isDark ? "#283934" : "#E5EBE8",
      shadowColor: isDark ? "#000000" : "#18201E",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 3,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 6,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#ECF2EF" : "#18201E",
      flex: 1,
      marginRight: 12,
    },
    cardDate: {
      fontSize: 12,
      fontWeight: "500",
      color: isDark ? "#8EA39C" : "#62726E",
    },
    cardPreview: {
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? "#8EA39C" : "#62726E",
    },
    emptyContainer: {
      paddingTop: 60,
      alignItems: "center",
    },
    emptyText: {
      fontSize: 14,
      fontStyle: "italic",
      color: isDark ? "#8EA39C" : "#62726E",
    },
    fab: {
      position: "absolute",
      right: 20,
      bottom: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: isDark ? "#4E9E80" : "#1B4938",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
  });
