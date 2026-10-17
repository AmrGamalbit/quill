import { dialog } from "@/src/components/Dialog/DialogProvider";
import FloatingActionButton from "@/src/components/FloatingActionButton";
import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts } from "../constants/typography";
import { haptic } from "../services/haptics";
import type { Entry, EntryWithCounts } from "../types/entry";
import Calendar from "./calendar/Calendar";
import EmptyState from "./entries/EmptyState";
import ListView from "./entries/ListView";
import SegmentedControl from "./SegmentedControl";

interface EntriesListProps {
  entries: EntryWithCounts[];
  diaryName?: string;
  onNewEntry: (date?: Date) => void;
  onSelectEntry?: (entry: Entry) => void;
  onClose?: () => void;
  onDeleteEntry?: (id: number) => void;
  closing?: boolean;
}

export default function EntriesList({
  entries,
  diaryName = "Diary",
  onNewEntry,
  onSelectEntry,
  onClose,
  onDeleteEntry,
  closing,
}: EntriesListProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState("list");

  const handleDayPress = (date: Date) => {
    haptic.press();
    setSelectedDate(date);
  };

  const handleDayLongPress = (date: Date) => {
    onNewEntry(date);
  };

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
    <SafeAreaView
      style={styles.container}
      edges={["top", "bottom", "left", "right"]}
    >
      <View style={styles.topBar}>
        {onClose && (
          <TouchableOpacity
            style={[styles.backBtn, closing && styles.hidden]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close diary"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text
            style={[styles.diaryHeading, closing && styles.hidden]}
            numberOfLines={1}
          >
            {diaryName}
          </Text>
          <Text style={styles.entryCountSubtitle}>
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </Text>
        </View>
      </View>
      <SegmentedControl
        options={[
          { label: "Feed", value: "feed" },
          { label: "Timeline", value: "timeline" },
          { label: "List", value: "list" },
        ]}
        selectedValue={selectedView}
        onSelect={setSelectedView}
      />
      <View style={{ marginVertical: 10 }}>
        <Calendar
          entries={entries}
          selectedDate={selectedDate}
          onDayPress={handleDayPress}
          onDayLongPress={handleDayLongPress}
        />
      </View>
      {entries.length > 0 ? (
        <ListView
          entries={entries}
          onDeleteEntry={onDeleteEntry}
          onSelectEntry={onSelectEntry}
        />
      ) : (
        <EmptyState />
      )}
      <FloatingActionButton onPress={() => onNewEntry()} />
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
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    backBtn: {
      paddingVertical: 4,
      paddingRight: 6,
    },
    titleContainer: {
      flex: 1,
    },
    diaryHeading: {
      fontFamily: fonts.heading,
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
    },
    entryCountSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: "500",
      marginTop: 1,
    },
    hidden: {
      opacity: 100,
    },
  });
