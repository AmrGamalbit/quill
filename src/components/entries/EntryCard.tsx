import usePressAnimation from "@/src/hooks/usePressAnimation";
import useTheme from "@/src/hooks/useTheme";
import type { EntryWithCounts } from "@/src/types/entry";
import { fromDateKey } from "@/src/utils/dates";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import AttachmentSummary from "./AttachmentSummary";

type EntryCardProps = { entry: EntryWithCounts; onPress: () => void };

export default function EntryCard({ entry, onPress }: EntryCardProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const { animatePress, animatedColor } = usePressAnimation(
    colors.card,
    colors.cardPressed,
  );
  const cleanPreview =
    entry.body?.replace(/<[^>]+>/g, "").trim() || "Empty entry.";
  const formattedDate = fromDateKey(entry.entryDate).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animatePress(true)}
      onPressOut={() => animatePress(false)}
    >
      <Animated.View style={[styles.card, { backgroundColor: animatedColor }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {entry.title || "Untitled Entry"}
          </Text>
          <Text style={styles.cardDate}>{formattedDate}</Text>
        </View>

        <Text style={styles.cardPreview} numberOfLines={5}>
          {cleanPreview}
        </Text>
        <View style={styles.hr}></View>
        <AttachmentSummary counts={entry.counts} />
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
    hr: {
      width: "100%",
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      marginVertical: 15,
    },
  });
