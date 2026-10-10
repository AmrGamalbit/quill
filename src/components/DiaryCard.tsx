import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacings";
import { fontSizes, fonts } from "../constants/typography";
import usePressAnimation from "../hooks/usePressAnimation";
import useTheme from "../hooks/useTheme";
import { haptic } from "../services/haptics";
import type { Diary } from "../types/diary";
import { dialog } from "./Dialog/DialogProvider";

type DiaryCardProps = {
  diary: Diary;
  entryCount: number;
  latestEntryBody?: string;
  onPress: () => void;
  onDelete: (id: number) => void;
};

// Dummy data: replace with real members once sharing is wired up.
const DUMMY_PEOPLE = ["Mia", "Leo", "Zara"];

const RIBBON_WIDTH = 22;
const RIBBON_LENGTH = 44;
const RIBBON_TAIL = 10;
const SPINE_WIDTH = 14;
const BOOK_CORNER = 4;

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

  const handleLongPress = () => {
    haptic.warning();
    dialog.alert(
      "Delete Diary",
      `Are you sure you want to delete "${diary.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {haptic.thud(); onDelete(diary.id)},
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
        <View style={[styles.spine, { backgroundColor: colors.border }]} />

        {/* Bookmark ribbon hanging from the top right */}
        <View style={styles.ribbon} pointerEvents="none">
          <View style={[styles.ribbonBody, { backgroundColor: colors.accent }]} />
          <View style={styles.ribbonTail}>
            <View
              style={[styles.tailHalfLeft, { borderLeftColor: colors.accent }]}
            />
            <View
              style={[styles.tailHalfRight, { borderRightColor: colors.accent }]}
            />
          </View>
        </View>

        <View style={styles.cover}>
          <View>
            <View style={[styles.label, { borderColor: colors.border }]}>
              <Text
                style={[styles.title, { color: colors.text }]}
                numberOfLines={2}
              >
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
          </View>

          <View>
            <Text style={[styles.peopleLabel, { color: colors.textMuted }]}>
              People
            </Text>
            <View style={styles.avatarRow}>
              {DUMMY_PEOPLE.map((img, i) => (
                <Image
                  key={img}
                  source={{
                    uri: `https://api.dicebear.com/9.x/notionists/png?seed=${img}&size=128`,
                  }}style={[
                    styles.avatar,
                    { borderColor: colors.border },
                    i > 0 && styles.avatarOverlap,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressableWrapper: {
    marginBottom: spacing.sm,
  },
  cardContainer: {
    aspectRatio: 6 / 7,
    height: '100%',
    borderWidth: 1,
    borderRadius: radius.md,
    borderTopLeftRadius: BOOK_CORNER,
    borderBottomLeftRadius: BOOK_CORNER,
    padding: spacing.md,
    paddingLeft: SPINE_WIDTH + spacing.md,
    paddingTop: RIBBON_LENGTH + RIBBON_TAIL + spacing.sm, // label starts below the ribbon
  },
  spine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: SPINE_WIDTH,
    borderTopLeftRadius: BOOK_CORNER,
    borderBottomLeftRadius: BOOK_CORNER,
  },
  ribbon: {
    position: "absolute",
    top: -1, // overlap the card border so it looks attached
    right: spacing.md,
    width: RIBBON_WIDTH,
  },
  ribbonBody: {
    width: RIBBON_WIDTH,
    height: RIBBON_LENGTH,
  },
  ribbonTail: {
    flexDirection: "row",
    width: RIBBON_WIDTH,
    height: RIBBON_TAIL,
  },
  tailHalfLeft: {
    width: 0,
    height: 0,
    borderLeftWidth: RIBBON_WIDTH / 2,
    borderBottomWidth: RIBBON_TAIL,
    borderBottomColor: "transparent",
  },
  tailHalfRight: {
    width: 0,
    height: 0,
    borderRightWidth: RIBBON_WIDTH / 2,
    borderBottomWidth: RIBBON_TAIL,
    borderBottomColor: "transparent",
  },
  cover: {
    flex: 1,
    justifyContent: "space-between",
  },
  label: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  title: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heading,
    fontWeight: "600",
    textAlign: "center",
  },
  entryCount: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.label,
    marginTop: spacing.xs,
  },
  preview: {
    fontSize: fontSizes.md,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  emptyPreview: {
    fontSize: fontSizes.md,
    fontStyle: "italic",
    marginTop: spacing.md,
  },
  peopleLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.label,
    marginBottom: spacing.xs,
  },
  avatarRow: {
    flexDirection: "row",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  avatarOverlap: {
    marginLeft: -spacing.sm,
  },
});