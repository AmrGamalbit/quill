import useTheme from '@/src/hooks/useTheme';
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { FullWindowOverlay } from 'react-native-screens';
import Button from '../Button';

export type DialogButton = {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
};
type Request = { title: string; message?: string; buttons: DialogButton[]; cancelable: boolean };

let enqueue: ((r: Request) => void) |  null = null;

export const dialog = {
    alert(
        title: string,
        message?: string,
        buttons: DialogButton[] = [{ text: 'OK' }],
        options?: { cancelable?: boolean },
    ) {
        const cancelable = options?.cancelable ?? true;
        if (!enqueue) {
            console.warn('[dialog] DialogProvider not mounted smh. Falling back to native alert :fire:')
            Alert.alert(title, message, buttons, {cancelable});
            return;
        }
        enqueue({ title, message, buttons, cancelable });
    },
    confirm(
        title: string,
        message?: string,
        opts: { confirmText?: string; cancelText?: string; destructive?: boolean } = {},
    ) {
        return new Promise<boolean>((resolve) => {
            dialog.alert(
                title,
                message,
                [
                    { text: opts.cancelText ?? 'Cancel', style: 'cancel', onPress: () => resolve(false)},
                    {
                        text: opts.confirmText ?? 'OK',
                        style: opts.destructive ? 'destructive' : 'default',
                        onPress: () => resolve(true),
                    },
                ],
                { cancelable: false },
            );
        });
    },
};

export function DialogProvider({ children }: { children: ReactNode }) {
    const { colors } = useTheme();
    const [queue, setQueue] = useState<Request[]>([]);
    const handled = useRef<Request | null>(null);
    const current = queue[0];

    const progress = useSharedValue(0);
    const [shown, setShown] = useState<Request | undefined>();

    useEffect(() => {
        if (current) {
            setShown(current);
            progress.value = 0;
            progress.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic)});
            return;
        }
        progress.value = withTiming(0, { duration: 120 });
        const t = setTimeout(() => setShown(undefined), 130);
        return () => clearTimeout(t);
    }, [current]);

    const backdropStyle = useAnimatedStyle(() => ({opacity: progress.value}));
    const cardStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        transform: [{ scale: interpolate(progress.value, [0, 1], [0.9, 1])}],
    }));

    const variantFor = (s?: DialogButton['style']) =>
        s === 'destructive' ? 'danger' : s === 'cancel' ? 'secondary' : 'primary';

    useEffect(() => {
        enqueue = (r) => setQueue((q) => [...q, r]);
        return () => {
            enqueue = null;
        };
    }, []);

    const close = (button?: DialogButton) => {
        if (!current || handled.current === current) return;
        handled.current = current;
        setQueue((q) => q.slice(1));
        button?.onPress?.();
    };

    const requestDismiss = () => {
        if (!current?.cancelable) return;
        close(current.buttons.find((b) => b.style === 'cancel'));
    };

    const textColor = (s?: DialogButton['style']) =>
        s === 'destructive' ? colors.danger : s === 'cancel' ? colors.textMuted : colors.accent;

        const content = shown && (
        <Pressable style={styles.backdrop} onPress={requestDismiss}>
            <Animated.View
                pointerEvents="none"
                style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }, backdropStyle]}
            />
            <Animated.View style={[styles.cardWrap, cardStyle]}>
                <Pressable
                    onPress={() => {}}
                    accessibilityViewIsModal
                    style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                    <Text style={[styles.title, { color: colors.text }]}>{shown.title}</Text>
                    {!!shown.message && (
                        <Text style={[styles.message, { color: colors.textMuted }]}>{shown.message}</Text>
                    )}
                    <View style={shown.buttons.length > 2 ? styles.col : styles.row}>
                        {shown.buttons.map((b, i) => (
                            <View key={i} style={shown.buttons.length <= 2 && { flex: 1 }}>
                                <Button
                                    label={b.text}
                                    variant={variantFor(b.style)}
                                    onPress={() => close(b)}
                                />
                            </View>
                        ))}
                    </View>
                </Pressable>
            </Animated.View>
        </Pressable>
    );

    return (
        <>
        {children}
        {Platform.OS === 'ios' ? (
            content ? <FullWindowOverlay>{content}</FullWindowOverlay> : null
        ) : (
            <Modal
            transparent
            visible={!!current}
            animationType='fade'
            statusBarTranslucent
            onRequestClose={requestDismiss}
            >
                {content}
            </Modal>
        )}
        </>
    )
}


const styles = StyleSheet.create({
    backdrop:{ ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: 24, },
    cardWrap: { width: '100%', maxWidth: 340 },
    card: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 20, gap: 8 },
    title: { fontSize: 18, fontWeight: '600' },
    message: { fontSize: 15, lineHeight: 21 },
    row: { flexDirection: 'row', gap: 8, marginTop: 12},
    col: { gap: 8, marginTop: 12 },
    btn: { paddingVertical: 12, paddingHorizontal: 12, alignItems: 'center', borderRadius: 12 },
    btnText: {fontSize: 16, fontWeight: '600'},
})