import {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

export default function useCalendarCollapse(selectedRow: number) {
  const progress = useSharedValue(1);

  const toggle = () => {
    progress.value = withTiming(progress.value === 1 ? 0 : 1, {
      duration: 300,
    });
  };

  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [0, 40]),
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const gridContainerStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [50, 300]),
  }));

  const gridStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [-selectedRow * 40, 0],
    );
    return {
      transform: [{ translateY }],
    };
  });

  return { toggle, headerStyle, gridContainerStyle, gridStyle };
}
