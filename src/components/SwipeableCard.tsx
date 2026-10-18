import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";
import { radius } from "../constants/radius";
import useTheme from "../hooks/useTheme";
type SwipeableCardProps = { children: ReactNode; onDelete: () => void };
export default function SwipeableCard({
  onDelete,
  children,
}: SwipeableCardProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const translateX = useSharedValue(0);
  const SWIPE_THRESHOLD = 120;
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (event.translationX > 0) translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(0, {}, () => runOnJS(onDelete)());
      } else {
        translateX.value = withSpring(0, { damping: 50 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const iconBackgroundStyle = useAnimatedStyle(() => {
    return { opacity: interpolate(translateX.value, [0, 50], [0, 1]) };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.backgroundContainer, iconBackgroundStyle]}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="trash-outline"
            size={24}
            style={{ color: colors.SegmentedControl }}
          />
        </View>
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={cardStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const getStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: { position: "relative" },
    backgroundContainer: {
      ...StyleSheet.absoluteFill,
      backgroundColor: colors.danger,
      justifyContent: "center",
      alignItems: "flex-start",
      borderRadius: radius.md,
    },
    iconContainer: {
      paddingLeft: 24,
      justifyContent: "center",
      alignItems: "center",
    },
  });
