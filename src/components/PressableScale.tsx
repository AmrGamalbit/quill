import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import useTheme from "../hooks/useTheme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends Omit<PressableProps, "style"> {
    style?: StyleProp<ViewStyle>;
    scaleTo?: number;
    borderless?: boolean;
}

export default function PressableScale({
    style, scaleTo = 0.94, borderless = true, onPressIn, onPressOut, children, ...rest
}: Props) {
    const { colors } = useTheme();
    const scale = useSharedValue(1);
    const reduce = useReducedMotion();
    const anim = useAnimatedStyle(() => ({transform: [{scale: scale.value}]}));

    return (
        <AnimatedPressable
        hitSlop={8}
        android_ripple={{color: colors.border, borderless, radius: borderless ? 24 : undefined, foreground: true}}
        onPressIn={(e) => {
            if (!reduce) scale.value = withTiming(scaleTo, { duration: 90 });
            onPressIn?.(e);
        }}
        {...rest}
        style={[style, anim]}
        >
            {children}
        </AnimatedPressable>
    );
}

type IconName = ComponentProps<typeof Ionicons>["name"];

export function IconButton({
    icon, label, onPress, color, size = 22, disabled, style,
}: {
    icon: IconName; label: string; onPress: () => void; color: string;
    size?: number; disabled?: boolean; style?: StyleProp<ViewStyle>;
}) {
    return (
        <PressableScale
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled }}
        style={[styles.icon, disabled && { opacity: 0.4 }, style]}
        >
            <Ionicons name={icon} size={size} color={color} />
        </PressableScale>
    );
}

const styles = StyleSheet.create({
    icon: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 22 },
});