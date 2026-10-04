import FloatingActionButton from "@/src/components/FloatingActionButton";
import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Entry } from "../types/entry";
import MonthGrid from "./calendar/MonthGrid";

interface EntriesListProps {
  entries: Entry[];
  diaryName?: string;
  onNewEntry: () => void;
  onSelectEntry?: (entry: Entry) => void;
  onBack?: () => void;
  onDeleteEntry?: (id: number) => void;
}

export default function EntriesList({
  entries,
  diaryName = "Diary",
  onNewEntry,
  onSelectEntry,
  onBack,
  onDeleteEntry,
}: EntriesListProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const handleSelectDate = (date: string) => {
    console.log(date);
    setSelectedDate(date);
  };

  const handleLongPress = (entry: Entry) => {
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

  const renderItem = ({ item }: { item: Entry }) => {
    const cleanPreview =
      item.body?.replace(/<[^>]+>/g, "").trim() || "Empty entry.";
    const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onSelectEntry && onSelectEntry(item)}
        activeOpacity={0.7}
        delayLongPress={400}
        onLongPress={() => handleLongPress(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title || "Untitled Entry"}
          </Text>
          <Text style={styles.cardDate}>{formattedDate}</Text>
        </View>

        <Text style={styles.cardPreview} numberOfLines={2}>
          {cleanPreview}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "bottom", "left", "right"]}
    >
      <View style={styles.container}>
        <View style={styles.topBar}>
          {onBack && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={onBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.diaryHeading} numberOfLines={1}>
              {diaryName}
            </Text>
            <Text style={styles.entryCountSubtitle}>
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </Text>
          </View>
        </View>
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={
            entries.length === 0 ? styles.emptyContainer : styles.listContent
          }
          ListHeaderComponent={
            <View style={{ marginVertical: 10 }}>
              <MonthGrid month={new Date()} />
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons
                name="book-outline"
                size={44}
                color={colors.textMuted}
              />
              <Text style={styles.emptyTitle}>No Entries Yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the pencil below to write your first entry.
              </Text>
            </View>
          }
        />
      </View>
      <FloatingActionButton onPress={onNewEntry} />
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
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      letterSpacing: -0.3,
    },
    entryCountSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: "500",
      marginTop: 1,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 110,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      flex: 1,
      marginRight: 12,
    },
    cardDate: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.textMuted,
    },
    cardPreview: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textMuted,
    },
    emptyContainer: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    emptyWrap: {
      alignItems: "center",
      gap: 8,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginTop: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 20,
    },
  });
