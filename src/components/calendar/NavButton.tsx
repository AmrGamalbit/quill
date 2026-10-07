import usePressAnimation from "@/src/hooks/usePressAnimation";
import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Animated, Pressable, StyleSheet } from "react-native";

type NavIconProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export default function NavButton({ icon, onPress }: NavIconProps) {
  const { colors } = useTheme();
  const { animatePress, animatedColor } = usePressAnimation(
    colors.background,
    colors.cardPressed,
  );
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animatePress(true)}
      onPressOut={() => animatePress(false)}
    >
      <Animated.View
        style={[{ backgroundColor: animatedColor }, styles.ionButton]}
      >
        <Ionicons name={icon} size={20} color={colors.textMuted} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ionButton: { padding: 2, borderRadius: 999 },
});
