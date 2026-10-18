import usePressAnimation from "@/src/hooks/usePressAnimation";
import useTheme from "@/src/hooks/useTheme";
import type { EntryWithCounts } from "@/src/types/entry";
import {
  formatCreatedMeta,
  formatEntryDate,
  fromDateKey,
} from "@/src/utils/dates";
import { Ionicons } from "@expo/vector-icons";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import AttachmentSummary from "./AttachmentSummary";

type EntryCardProps = {
  entry: EntryWithCounts;
  onPress: () => void;
  onLongPress: (entry: EntryWithCounts) => void;
};

export default function EntryCard({
  entry,
  onPress,
  onLongPress,
}: EntryCardProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const entryDate = fromDateKey(entry.entryDate);

  const { animatePress, animatedColor } = usePressAnimation(
    colors.card,
    colors.cardPressed,
  );
  const cleanPreview =
    entry.body
      ?.replace(/<br\s*\/?>/gi, "\n")
      ?.replace(/<\/p>|<\/div>/gi, "\n")
      ?.replace(/<[^>]+>/g, "")
      ?.replace(/\n\s*\n/g, "\n\n")
      .trim() || "Empty entry.";

  return (
    <Pressable
      onPress={onPress}
      onLongPress={() => onLongPress(entry)}
      onPressIn={() => animatePress(true)}
      onPressOut={() => animatePress(false)}
    >
      <Animated.View style={[styles.card, { backgroundColor: animatedColor }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {entry.title || "Untitled Entry"}
          </Text>
          <Text style={styles.cardDate}>{formatEntryDate(entryDate)}</Text>
        </View>

        <Text style={styles.cardPreview} numberOfLines={3}>
          {cleanPreview}
        </Text>
        <View style={styles.hr}></View>
        <View style={styles.cardFooter}>
          <AttachmentSummary counts={entry.counts} />
          <View style={styles.cardFooterRight}>
            <Text style={styles.cardDate}>
              {formatCreatedMeta(entry.createdAt, entryDate)}
            </Text>
            <Ionicons
              size={16}
              color={colors.textMuted}
              name="chevron-forward-outline"
            />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const getStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
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
    cardFooter: { flexDirection: "row", justifyContent: "space-between" },
    cardFooterRight: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },
    hr: {
      width: "100%",
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      marginVertical: 15,
    },
  });
