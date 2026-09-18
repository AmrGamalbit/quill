import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import useTheme from "../hooks/useTheme";

export default function FloatingActionButton({
  onPress,
}: {
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const color = useRef(new Animated.Value(0)).current;
  const animatePress = (pressed: boolean) =>
    Animated.timing(color, {
      toValue: pressed ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  const backgroundColor = color.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.fabBackground, colors.fabBackgroundPressed],
  });
  return (
    <Pressable
      style={styles.fabContainer}
      onPress={onPress}
      onPressIn={() => animatePress(true)}
      onPressOut={() => animatePress(false)}
    >
      <Animated.View
        style={[styles.fab, { backgroundColor, shadowColor: colors.shadow }]}
      >
        <Ionicons name="pencil" size={22} color={colors.textOnAccent} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    right: 24,
    bottom: 30,
    width: 54,
    height: 54,
  },
  fab: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
    elevation: 6,
  },
});
