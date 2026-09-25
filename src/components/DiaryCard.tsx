import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacings";
import { fontSizes, fonts } from "../constants/typography";
import usePressAnimation from "../hooks/usePressAnimation";
import useTheme from "../hooks/useTheme";
import type { Diary } from "../types/diary";

type DiaryCardProps = {
  diary: Diary;
  entryCount: number;
  latestEntryBody?: string;
  onPress: () => void;
  onDelete: (id: string) => void;
};

export default function DiaryCard({
  diary,
  entryCount,
  latestEntryBody,
  onPress,
  onDelete,
}: DiaryCardProps) {
  const { colors } = useTheme();
  const { animatePress, animatedColor } = usePressAnimation(
    colors.card,
    colors.cardPressed,
  );
  console.log("this is entryCount" + entryCount);
  console.log(latestEntryBody);

  const handleLongPress = () => {
    Alert.alert(
      "Delete Diary",
      `Are you sure you want to delete "${diary.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(diary.id),
        },
      ],
    );
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={500}
      onPressIn={() => animatePress(true)}
      onPressOut={() => animatePress(false)}
      style={styles.pressableWrapper}
    >
      <Animated.View
        style={[
          styles.cardContainer,
          {
            borderColor: colors.border,
            backgroundColor: animatedColor,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {diary.name}
          </Text>
          <Text style={[styles.entryCount, { color: colors.textMuted }]}>
            {entryCount || 0} {entryCount === 1 ? "entry" : "entries"}
          </Text>
        </View>

        {entryCount > 0 && latestEntryBody ? (
          <Text
            style={[styles.preview, { color: colors.textMuted }]}
            numberOfLines={2}
          >
            {latestEntryBody.replace(/<[^>]+>/g, "").trim()}
          </Text>
        ) : (
          <Text style={[styles.emptyPreview, { color: colors.textMuted }]}>
            No entries yet. Tap to open and start writing.
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressableWrapper: {
    marginBottom: spacing.sm,
  },
  cardContainer: {
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSizes.md,
    fontFamily: fonts.heading,
    fontWeight: "600",
  },
  entryCount: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.label,
  },
  preview: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  emptyPreview: {
    fontSize: fontSizes.xs,
    fontStyle: "italic",
    marginTop: spacing.xs,
  },
});
