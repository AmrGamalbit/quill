import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacings";
import { fonts } from "../constants/typography";
import usePressAnimation from "../hooks/usePressAnimation";
import useTheme from "../hooks/useTheme";

type buttonProps = {
  label: string;
  onPress: () => void;
};
export default function Button({ label, onPress }: buttonProps) {
  const { colors } = useTheme();
  const { animatePress, animatedColor } = usePressAnimation(
    colors.accent,
    colors.accentPressed,
  );
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animatePress(true)}
      onPressOut={() => animatePress(false)}
    >
      <Animated.View
        style={[styles.buttonContainer, { backgroundColor: animatedColor }]}
      >
        <Text style={[styles.buttonLabel, { color: colors.textOnAccent }]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  buttonLabel: {
    fontFamily: fonts.label,
  },
});
