import useTheme from "@/src/hooks/useTheme";
import { haptic } from "@/src/services/haptics";
import { Entry, EntryWithCounts } from "@/src/types/entry";
import { FlatList, StyleSheet } from "react-native";
import { dialog } from "../Dialog/DialogProvider";
import EntryCard from "./EntryCard";

type ListViewProps = {
  entries: EntryWithCounts[];
  onSelectEntry?: (entry: Entry) => void;
  onDeleteEntry?: (id: number) => void;
};
export default function ListView({
  entries,
  onSelectEntry,
  onDeleteEntry,
}: ListViewProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const handleLongPress = (entry: Entry) => {
    if (!onDeleteEntry) return;
    haptic.press();
    dialog.alert(
      "Delete Entry",
      `Are you sure you want to delete "${entry.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            haptic.warning();
            onDeleteEntry(entry.id);
          },
        },
      ],
    );
  };

  return (
    <FlatList
      data={entries}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <EntryCard entry={item} onPress={() => onSelectEntry(item)} />
      )}
      //   contentContainerStyle={
      //     entries.length === 0 ? styles.emptyContainer : styles.listContent
      //   }
      contentContainerStyle={styles.listContent}
    />
  );
}

const getStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 110,
    },
  });
