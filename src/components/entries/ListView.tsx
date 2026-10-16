import useTheme from "@/src/hooks/useTheme";
import { haptic } from "@/src/services/haptics";
import { Entry } from "@/src/types/entry";
import { fromDateKey } from "@/src/utils/dates";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { dialog } from "../Dialog/DialogProvider";

type ListViewProps = {
  entries: Entry[];
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
  const renderItem = ({ item }: { item: Entry }) => {
    const cleanPreview =
      item.body?.replace(/<[^>]+>/g, "").trim() || "Empty entry.";
    const formattedDate = fromDateKey(item.entryDate).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    );

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
    <FlatList
      data={entries}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
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
  });
