import { dialog } from "@/src/components/Dialog/DialogProvider";
import { resolveDiaryColor } from "@/src/constants/colors";
import { fonts, fontSizes } from "@/src/constants/typography";
import { useUserSession } from "@/src/context/UserSessionContext";
import { db } from "@/src/db";
import { diaryMembersTable } from "@/src/db/schema";
import useTheme from "@/src/hooks/useTheme";
import { haptic } from "@/src/services/haptics";
import { useSyncStatus } from "@/src/services/syncEngine";
import type { Entry } from "@/src/types/entry";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { EntryWithCounts } from "../types/entry";
import { isSameDay } from "../utils/dates";
import Calendar from "./calendar/Calendar";
import EmptyState from "./entries/EmptyState";
import ListView from "./entries/ListView";
import SegmentedControl from "./SegmentedControl";

interface EntriesListProps {
  entries: EntryWithCounts[];
  diaryName?: string;
  diaryColor?: string;
  onNewEntry: (date?: Date) => void;
  onSelectEntry?: (entry: Entry) => void;
  onClose?: () => void;
  onDeleteEntry?: (id: number) => void;
  onOpenMembers?: () => void;
  closing?: boolean;
}

export default function EntriesList({
  entries,
  diaryName = "Diary",
  diaryColor = "cobalt",
  onNewEntry,
  onSelectEntry,
  onClose,
  onDeleteEntry,
  onOpenMembers,
  closing,
}: EntriesListProps) {
  const { colors } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedView, setSelectedView] = useState("list");
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const diaryAccent = resolveDiaryColor(diaryColor, scheme);
  const { session } = useUserSession();
  const isSyncing = useSyncStatus();
  const styles = getStyles(colors, diaryAccent);
  const [authorMap, setAuthorMap] = useState<Record<string, string>>({});

  useEffect(() => {
    db.select()
      .from(diaryMembersTable)
      .then((rows) => {
        const map: Record<string, string> = {};
        for (const r of rows) {
          map[r.userId] = r.name || (r.username ? `@${r.username}` : "Member");
        }
        setAuthorMap(map);
      })
      .catch(() => {});
  }, [entries, isSyncing]);

  const handleDayPress = (date: Date) => {
    haptic.press();
    setSelectedDate((prev) => {
      if (prev && isSameDay(prev, date)) return null;
      return date;
    });
  };

  const handleDayLongPress = (date: Date) => {
    onNewEntry(date);
  };

  const handleLongPress = (entry: Entry) => {
    if (!onDeleteEntry) return;
    if (
      entry.authorId &&
      session?.userId &&
      entry.authorId !== session.userId
    ) {
      dialog.alert(
        "Read Only",
        "You can only delete entries that you created.",
      );
      return;
    }
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
            style={[styles.iconButton, closing && styles.hidden]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close diary"
            hitSlop={12}
          >
            <Ionicons name="close" size={20} color={colors.text} />
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
          selectedDate={selectedDate}
          onDeleteEntry={onDeleteEntry}
          onSelectEntry={onSelectEntry}
          onOpenMembers={onOpenMembers}
          diaryAccent={diaryAccent}
        />
      ) : (
        <EmptyState />
      )}
    </SafeAreaView>
  );
}

const getStyles = (
  colors: ReturnType<typeof useTheme>["colors"],
  diaryAccent: string,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    titleContainer: {
      flex: 1,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    diaryDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: diaryAccent,
    },
    diaryHeading: {
      fontFamily: fonts.heading,
      fontSize: fontSizes.lg,
      fontWeight: "700",
      color: colors.text,
      flexShrink: 1,
    },
    subtitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 2,
    },
    entryCountSubtitle: {
      fontSize: fontSizes.xs,
      fontFamily: fonts.body,
      color: colors.textMuted,
    },
    syncInline: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    syncInlineText: {
      fontSize: 11,
      fontFamily: fonts.label,
      fontWeight: "700",
      color: diaryAccent,
    },

    calendarWrap: {
      marginVertical: 8,
    },
    hidden: {
      opacity: 100,
    },
  });
