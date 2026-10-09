import { useWindowDimensions } from "react-native";
import {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

export default function useCalendarCollapse(selectedRow: number) {
  const progress = useSharedValue(0);
  const { width } = useWindowDimensions();
  const rowH = width / 7;

  const toggle = () => {
    progress.value = withTiming(progress.value === 1 ? 0 : 1, {
      duration: 300,
    });
  };

  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [0, 48]),
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const gridContainerStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [rowH, rowH * 6]),
  }));

  const gridStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [-selectedRow * rowH, 0],
    );
    return {
      transform: [{ translateY }],
    };
  });

  return { toggle, headerStyle, gridContainerStyle, gridStyle };
}
