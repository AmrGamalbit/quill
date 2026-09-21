import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacings";
import { fontSizes, fonts } from "../constants/typography";
import usePressAnimation from "../hooks/usePressAnimation";
import useTheme from "../hooks/useTheme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

type buttonProps = {
  label: string;
  onPress: () => void;
};
export default function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors } = useTheme();

  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";

  const defaultBg = isPrimary
    ? colors.accent
    : isOutline
    ? "transparent"
    : colors.card;

  const pressedBg = isPrimary
    ? colors.accentPressed
    : isOutline
    ? colors.cardPressed
    : colors.cardPressed;

  const { animatePress, animatedColor } = usePressAnimation(defaultBg, pressedBg);

  const textColor = isPrimary
    ? colors.textOnAccent
    : isOutline
    ? colors.accent
    : colors.text;
  const isInteractive = !loading && !disabled;

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      onPressIn={() => isInteractive && animatePress(true)}
      onPressOut={() => isInteractive && animatePress(false)}
      disabled={!isInteractive}
      style={({ pressed }) => [
        styles.pressableBase,
        disabled && styles.disabledContainer,
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            backgroundColor: animatedColor,
            borderColor: isOutline ? colors.accent : "transparent",
            borderWidth: isOutline ? 1 : 0,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <Text style={[styles.buttonLabel, { color: textColor }, textStyle]}>
            {label}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressableBase: {
    width: "100%",
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  buttonLabel: {
    fontFamily: fonts.label,
    fontSize: fontSizes.md,
    fontWeight: "600",
  },
  disabledContainer: {
    opacity: 0.5,
  },
});
