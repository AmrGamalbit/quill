import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import useTheme from "../hooks/useTheme";
import type { Rect } from "./MediaViewer";
import PressableScale, { IconButton } from "./PressableScale";

export interface MenuAction {
    key: string;
    icon: ComponentProps<typeof Ionicons>["name"];
    label: string;
    onPress: () => void;
}

export default function AttachMenu({ actions }: { actions: MenuAction[] }) {
    const { colors } = useTheme();
    const { width: SW } = useWindowDimensions();
    const ref = useRef<View>(null);
    const [anchor, setAnchor] = useState<Rect | null>(null);

    const open = () =>
        ref.current?.measureInWindow((x, y, width, height) => setAnchor({ x, y, width, height }));
    const close = () => setAnchor(null);
    const run = (a: MenuAction) => { close(); setTimeout(a.onPress, 320); };

    return (
        <>
        <View ref={ref} collapsable={false}>
            <IconButton icon="attach" label="Add attachment" onPress={open} color={colors.text} />
            </View>
            <Modal visible={!!anchor} transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={close}>
                <View style={StyleSheet.absoluteFill}>
                <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityRole="button" accessibilityLabel="Close menu" />
                {anchor && (
                    <Animated.View
                    entering={FadeInUp.duration(150)}
                    style={[
                        styles.menu,
                        {
                            top: anchor.y + anchor.height + 4,
                            right: Math.max(8, SW - (anchor.x + anchor.width)),
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                            shadowColor: colors.shadow,
                        },
                    ]}
                    >
                        {actions.map((a) => (
                            <PressableScale
                            key={a.key}
                            borderless={false}
                            scaleTo={0.98}
                            onPress={() => run(a)}
                            accessibilityRole="menuitem"
                            accessibilityLabel={a.label}
                            style={styles.item}
                            >
                                <Ionicons name={a.icon} size={20} color={colors.text} />
                                <Text style={[styles.label, { color: colors.text }]}>{a.label}</Text>
                            </PressableScale>
                        ))}
                    </Animated.View>
                )}
                </View>
            </Modal>
            </>
    )
}

const styles = StyleSheet.create({
    menu: { position: "absolute", minWidth: 210, borderRadius: 14, borderWidth: 1, paddingVertical: 6, overflow: "hidden", elevation: 8, shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }},
    item: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48, paddingHorizontal: 16 },
    label: { fontSize: 15, fontWeight: "500" },
})