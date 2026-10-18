import { dialog } from "@/src/components/Dialog/DialogProvider";
import FloatingActionButton from "@/src/components/FloatingActionButton";
import { resolveDiaryColor } from "@/src/constants/colors";
import { radius } from "@/src/constants/radius";
import { spacing } from "@/src/constants/spacings";
import { fonts, fontSizes } from "@/src/constants/typography";
import { useUserSession } from "@/src/context/UserSessionContext";
import { db } from "@/src/db";
import { diaryMembersTable } from "@/src/db/schema";
import useTheme from "@/src/hooks/useTheme";
import { haptic } from "@/src/services/haptics";
import { useSyncStatus } from "@/src/services/syncEngine";
import type { Entry } from "@/src/types/entry";
import { fromDateKey } from "@/src/utils/dates";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Calendar from "./calendar/Calendar";

interface EntriesListProps {
  entries: Entry[];
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
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const diaryAccent = resolveDiaryColor(diaryColor, scheme);
  const { session } = useUserSession();
  const isSyncing = useSyncStatus();
  const styles = getStyles(colors, diaryAccent);
  const [selectedDate, setSelectedDate] = useState(new Date());
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
    setSelectedDate(date);
  };

  const handleDayLongPress = (date: Date) => {
    onNewEntry(date);
  };

  const handleLongPress = (entry: Entry) => {
    if (!onDeleteEntry) return;
    if (entry.authorId && session?.userId && entry.authorId !== session.userId) {
      dialog.alert("Read Only", "You can only delete entries that you created.");
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

  const renderItem = ({ item }: { item: Entry }) => {
    const cleanPreview =
      item.body?.replace(/<[^>]+>/g, "").trim() || "Empty entry.";
    const dateObj = fromDateKey(item.entryDate);
    const dayNum = dateObj.toLocaleDateString("en-US", { day: "2-digit" });
    const monthShort = dateObj
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();
    const isMe = !item.authorId || item.authorId === session?.userId;
    const authorName = isMe
      ? session?.name || "You"
      : authorMap[item.authorId!] || "Collaborator";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onSelectEntry && onSelectEntry(item)}
        activeOpacity={0.78}
        delayLongPress={400}
        onLongPress={() => handleLongPress(item)}
      >
        <View style={styles.cardRow}>
          <View style={styles.dateBox}>
            <Text style={styles.dateMonth}>{monthShort}</Text>
            <Text style={styles.dateDay}>{dayNum}</Text>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.cardTopLine}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title || "Untitled Entry"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textMuted}
              />
            </View>

            <Text style={styles.cardPreview} numberOfLines={2}>
              {cleanPreview}
            </Text>

            <View style={styles.cardFooter}>
              <View
                style={[
                  styles.authorPill,
                  isMe ? styles.authorPillMe : styles.authorPillOther,
                ]}
              >
                <View
                  style={[
                    styles.authorDot,
                    {
                      backgroundColor: isMe ? diaryAccent : colors.textMuted,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.authorText,
                    { color: isMe ? diaryAccent : colors.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {isMe ? `${authorName} • YOU` : authorName}
                </Text>
              </View>
            </View>
          </View>
        </View>
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
            <View style={styles.titleRow}>
              <View style={styles.diaryDot} />
              <Text
                style={[styles.diaryHeading, closing && styles.hidden]}
                numberOfLines={1}
              >
                {diaryName}
              </Text>
            </View>
            <View style={styles.subtitleRow}>
              <Text style={styles.entryCountSubtitle}>
                {entries.length} {entries.length === 1 ? "memory" : "memories"}
              </Text>
              {isSyncing && (
                <View style={styles.syncInline}>
                  <ActivityIndicator size="small" color={diaryAccent} />
                  <Text style={styles.syncInlineText}>Syncing</Text>
                </View>
              )}
            </View>
          </View>

          {onOpenMembers && (
            <TouchableOpacity
              onPress={onOpenMembers}
              hitSlop={10}
              style={styles.membersButton}
              activeOpacity={0.75}
            >
              <Ionicons name="people" size={16} color={diaryAccent} />
           {/*   <Text style={styles.membersButtonText}>Members</Text> */}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.calendarWrap}>
          <Calendar
            entries={entries}
            selectedDate={selectedDate}
            onDayPress={handleDayPress}
            onDayLongPress={handleDayLongPress}
          />
        </View>

        <FlatList
          data={entries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={
            entries.length === 0 ? styles.emptyContainer : styles.listContent
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="sparkles-outline" size={32} color={diaryAccent} />
              </View>
              <Text style={styles.emptyTitle}>No Memories Yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the button below or long-press any calendar day to capture a moment.
              </Text>
            </View>
          }
        />
      </View>
      <FloatingActionButton onPress={() => onNewEntry()} />
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
      paddingHorizontal: spacing.lg,
      paddingVertical: 14,
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
    membersButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: diaryAccent,
    },
    membersButtonText: {
      fontSize: 12,
      fontFamily: fonts.label,
      fontWeight: "700",
      color: colors.text,
    },
    calendarWrap: {
      marginVertical: 8,
    },
    listContent: {
      paddingHorizontal: spacing.md,
      paddingTop: 8,
      paddingBottom: 110,
      gap: 12,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 14,
    },
    dateBox: {
      width: 50,
      paddingVertical: 8,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    dateMonth: {
      fontSize: 10,
      fontFamily: fonts.label,
      fontWeight: "800",
      color: diaryAccent,
      letterSpacing: 0.6,
    },
    dateDay: {
      fontSize: 18,
      fontFamily: fonts.heading,
      fontWeight: "700",
      color: colors.text,
      marginTop: 1,
    },
    cardBody: {
      flex: 1,
      gap: 6,
    },
    cardTopLine: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    cardTitle: {
      fontSize: fontSizes.md,
      fontFamily: fonts.heading,
      fontWeight: "700",
      color: colors.text,
      flex: 1,
    },
    cardPreview: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.body,
      lineHeight: 20,
      color: colors.textMuted,
    },
    cardFooter: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    authorPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 999,
      borderWidth: 1,
    },
    authorPillMe: {
      backgroundColor: colors.surface,
      borderColor: diaryAccent,
    },
    authorPillOther: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    authorDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    authorText: {
      fontSize: 11,
      fontFamily: fonts.label,
      fontWeight: "700",
    },
    emptyContainer: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    emptyWrap: {
      alignItems: "center",
      gap: 10,
    },
    emptyIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: diaryAccent,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    emptyTitle: {
      fontSize: fontSizes.lg,
      fontFamily: fonts.heading,
      fontWeight: "700",
      color: colors.text,
    },
    emptySubtitle: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.body,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 20,
    },
    hidden: {
      opacity: 0,
    },
  });