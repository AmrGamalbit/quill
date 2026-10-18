import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function useCalendarCollapse(selectedRow: number) {
  const [isExapnded, setIsExpanded] = useState(false);
  const progress = useSharedValue(0);
  const startProgress = useSharedValue(0);
  const { width } = useWindowDimensions();
  const rowH = width / 7;

  const toggle = () => {
    progress.value = withTiming(progress.value === 1 ? 0 : 1, {
      duration: 300,
    });
    setIsExpanded((prev) => !prev);
  };

  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [0, 48]),
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const gridContainerStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [rowH, rowH * 6]),
  }));

  const chevronRotation = useAnimatedStyle(() => {
    const rotate = interpolate(
      progress.value,
      [0, 1],
      [0, 180],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

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

  const panGesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .failOffsetX([-20, 20])
    .onStart(() => {
      startProgress.value = progress.value;
    })
    .onUpdate((event) => {
      const next = startProgress.value + event.translationY / (rowH * 5);
      progress.value = Math.min(Math.max(next, 0), 1);
    })
    .onEnd((event) => {
      const target = progress.value > 0.5 ? 1 : 0;
      progress.value = withSpring(target, {
        velocity: event.velocityY / (rowH * 5),
        overshootClamping: target == 0,
        damping: 50,
        stiffness: 200,
      });
    });

  return {
    toggle,
    headerStyle,
    gridContainerStyle,
    gridStyle,
    panGesture,
    isExapnded,
    chevronRotation,
  };
}
