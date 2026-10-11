import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { resolveDiaryColor } from "../constants/colors";
import { spacing } from "../constants/spacings";
import { fontSizes, fonts } from "../constants/typography";
import usePressAnimation from "../hooks/usePressAnimation";
import useTheme from "../hooks/useTheme";
import { haptic } from "../services/haptics";
import type { Diary } from "../types/diary";
import { dialog } from "./Dialog/DialogProvider";

type DiaryCardProps = {
  diary: Diary;
  onPress: () => void;
  onDelete: (id: number) => void;
};

const SPINE_WIDTH = 12;
const RIBBON_HEIGHT = 16;
const RIBBON_LENGTH = 44;
const RIBBON_OVERHANG = 14;
const RIBBON_NOTCH = 7;
const MAX_JITTER = 8;

export const STACK_SIDE_PADDING = RIBBON_OVERHANG + MAX_JITTER + 6;

const thicknessFor = (id: number) => 64 + (id % 3) * 8;
const jitterFor = (id: number) => (((id * 7) % 5) - 2) * (MAX_JITTER / 2);

export default function DiaryCard({ diary, onPress, onDelete }: DiaryCardProps) {
  const {colors, isDark} = useTheme();
  const { animatePress, animatedColor} = usePressAnimation(
    colors.card,
    colors.cardPressed,
  );

  const thickness = thicknessFor(diary.id);
  const ribbonColor = resolveDiaryColor(diary.color, isDark ? "dark" : "light");
  const entryLabel = `${diary.entryCount} ${diary.entryCount === 1 ? "entry" : "entries"}`;

  const handleLongPress = () => {
    haptic.warning();
    dialog.alert(
      "Delete Diary",
      `Are you sure you want to delete "${diary.name}"? This action cannot be undone.`,
      [
        {text: "Cancel", style: "cancel"},
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            haptic.thud();
            onDelete(diary.id);
          },
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
    accessibilityRole="button"
    accessibilityLabel={`${diary.name}, ${entryLabel}`}
    style={[styles.wrapper, { transform: [{translateX: jitterFor(diary.id)}]}]}
    >
      <Animated.View
      style={[
        styles.book,
        {height: thickness, borderColor: colors.border, backgroundColor: animatedColor},
      ]}
      >
        <View style={[styles.spine, {backgroundColor: colors.border}]} />

        <View style={styles.labels}>
          <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
            {diary.name}
          </Text>
          <Text style={[styles.count, { color: colors.textMuted }]}>{entryLabel}</Text>
        </View>

        <Svg
        width={RIBBON_LENGTH}
        height={RIBBON_HEIGHT}
        style={[
          styles.ribbon,
          { right: -RIBBON_OVERHANG, top: (thickness - RIBBON_HEIGHT) / 2 },
        ]}
        >
          <Polygon
          points={`0,0 ${RIBBON_LENGTH},0 ${RIBBON_LENGTH - RIBBON_NOTCH},${RIBBON_HEIGHT / 2} ${RIBBON_LENGTH},${RIBBON_HEIGHT} 0,${RIBBON_HEIGHT}`}
          fill={ribbonColor}
          />
        </Svg>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: -1, // neighbouring books share a border line
  },
  book: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 6,
  },
  spine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: SPINE_WIDTH,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  labels: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: SPINE_WIDTH + spacing.md,
    paddingRight: RIBBON_LENGTH - RIBBON_OVERHANG + spacing.sm,
  },
  title: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heading,
    fontWeight: "600",
  },
  count: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.label,
    marginTop: spacing.xs,
  },
  ribbon: {
    position: "absolute",
    pointerEvents: "none",
  },
});