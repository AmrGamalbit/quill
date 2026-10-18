import { fontSizes } from "@/src/constants/typography";
import useTheme from "@/src/hooks/useTheme";
import { haptic } from "@/src/services/haptics";
import { Entry, EntryWithCounts } from "@/src/types/entry";
import { formatEntryDate, toDateKey } from "@/src/utils/dates";
import { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { dialog } from "../Dialog/DialogProvider";
import Pill from "../Pill";
import EntryCard from "./EntryCard";

type ListViewProps = {
  entries: EntryWithCounts[];
  selectedDate: Date | null;
  onSelectEntry?: (entry: Entry) => void;
  onDeleteEntry?: (id: number) => void;
};
export default function ListView({
  entries,
  selectedDate,
  onSelectEntry,
  onDeleteEntry,
}: ListViewProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const selectedKey = selectedDate ? toDateKey(selectedDate) : null;

  const selectedDateEntries = useMemo(() => {
    return selectedDate
      ? entries.filter((e) => e.entryDate === selectedKey)
      : [];
  }, [selectedDate, entries]);

  const otherEntries = useMemo(() => {
    return selectedDate
      ? entries.filter((e) => e.entryDate !== selectedKey)
      : entries;
  }, [selectedDate, entries]);

  const handleLongPress = (entry: EntryWithCounts) => {
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

  const header = selectedDate ? (
    <View style={styles.header}>
      <View style={styles.selectedDayRow}>
        <View style={styles.selectedDayTitle}>
          <Pill text="Selected Day" />
          <Text style={styles.selectedDayDate}>
            {formatEntryDate(selectedDate)}
          </Text>
        </View>
        <Text style={styles.entryCount}>
          {`${selectedDateEntries.length} ${entries.length === 1 ? "entry" : "entries"}`}
        </Text>
      </View>
      <FlatList
        data={selectedDateEntries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <EntryCard
            entry={item}
            onPress={() => onSelectEntry?.(item)}
            onLongPress={(entry) => handleLongPress(entry)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
      <Pill text="Other entries" />
    </View>
  ) : null;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={otherEntries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <EntryCard
            entry={item}
            onPress={() => onSelectEntry?.(item)}
            onLongPress={(entry) => handleLongPress(entry)}
          />
        )}
        ListHeaderComponent={header}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const getStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 50,
    },
    header: { marginBottom: 10 },
    selectedDayRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },
    selectedDayTitle: { flexDirection: "row", alignItems: "center", gap: 10 },
    selectedDayDate: {
      color: colors.textMuted,
      fontWeight: 500,
      fontSize: fontSizes.xs,
    },
    entryCount: {
      color: colors.textMuted,
      fontWeight: 500,
      fontSize: fontSizes.xs,
    },
  });
