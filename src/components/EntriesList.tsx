import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useTheme from "../hooks/useTheme";
import { JournalEntry } from "../utils/db";
import FloatingActionButton from "./FloatingActionButton";

interface EntriesListProps {
  entries: JournalEntry[];
  onNewEntry: () => void;
  onSelectEntry?: (entry: JournalEntry) => void;
  onOpenSettings?: () => void;
}

export default function EntriesList({
  entries,
  onNewEntry,
  onSelectEntry,
  onOpenSettings,
}: EntriesListProps) {
  const { colors } = useTheme();
  const renderItem = ({ item }: { item: JournalEntry }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onSelectEntry && onSelectEntry(item.id)}
      activeOpacity={0.7}
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
        {item.body.replace(/<[^>]+>/g, "").trim() || "No text content."}
      </Text>
    </TouchableOpacity>
  );
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.topBar, { backgroundColor: colors.background }]}>
        <Text style={[styles.heading, { color: colors.text }]}>My Entries</Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View
            style={[styles.emptyContainer, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No journals written yet.
            </Text>
          </View>
        }
      />
      <FloatingActionButton onPress={onNewEntry} />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
  },
  newBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  newBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  cardDate: {
    fontSize: 12,
    fontWeight: "500",
  },
  cardPreview: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 20,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 30,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
    elevation: 6,
  },
});
