import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Animated,
    Image,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useTheme from "../hooks/useTheme";

const PILL_HEIGHT = 48;
const AVATAR_SIZE = 36;
const TINT_OPACITY = 0.12;
const SCROLL_DISTANCE = 40;

type TopBarProps = {
    name: string;
    photoUri?: string | null;
    onAvatarPress: () => void;
    scrollY: Animated.Value;
};

export default function TopBar({ name, photoUri, onAvatarPress, scrollY }: TopBarProps) {
    const { colors, fonts, fontSizes, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const [imageFailed, setImageFailed] = useState(false);
    const showPhoto = !!photoUri && !imageFailed;
    const tintOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DISTANCE],
        outputRange: [0, TINT_OPACITY],
        extrapolate: "clamp",
    });

    const avatarStyle = {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
    };

    return (
        <View
            style={{
                paddingTop: insets.top + spacing.sm,
                paddingBottom: spacing.md,
                paddingHorizontal: spacing.lg,
            }}
        >
            {/* Accent tint: translucent overlay, so no hex values or alpha math needed */}
            <Animated.View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: colors.accent,
                    opacity: tintOpacity,
                }}
            />

            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    height: PILL_HEIGHT,
                    paddingLeft: spacing.md,
                    paddingRight: (PILL_HEIGHT - AVATAR_SIZE) / 2,
                    borderRadius: PILL_HEIGHT / 2,
                    backgroundColor: colors.card,
                    borderColor: colors.textMuted,
                    borderWidth: 1,
                }}
            >
                <Ionicons name="search-outline" size={18} color={colors.textMuted} />
                <TextInput
                    placeholder="Search across Quill"
                    placeholderTextColor={colors.textMuted}
                    returnKeyType="search"
                    underlineColorAndroid="transparent"
                    style={{
                        flex: 1,
                        marginHorizontal: spacing.sm,
                        paddingVertical: 0, // avoids Android's default vertical padding
                        color: colors.text,
                        fontSize: fontSizes.md,
                    }}
                />
                <Pressable
                    onPress={onAvatarPress}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Open settings"
                >
                    {showPhoto ? (
                        <Image
                            source={{ uri: photoUri! }}
                            style={avatarStyle}
                            onError={() => setImageFailed(true)}
                        />
                    ) : (
                        <View
                            style={[
                                avatarStyle,
                                {
                                    backgroundColor: colors.background,
                                    alignItems: "center",
                                    justifyContent: "center",
                                },
                            ]}
                        >
                            <Text
                                style={{
                                    color: colors.text,
                                    fontFamily: fonts.heading,
                                    fontSize: fontSizes.md,
                                }}
                            >
                                {name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                </Pressable>
            </View>
        </View>
    );
}