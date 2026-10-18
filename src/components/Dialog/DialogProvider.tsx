import { fonts } from '@/src/constants/typography';
import useTheme from '@/src/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
// CHECK HANDLECOPY FUNCTION SIRR import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
    Alert,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { FullWindowOverlay } from 'react-native-screens';
import Button from '../Button';

export type DialogButton = {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
};

type DialogOptions = {
    cancelable?: boolean;
    code?: string;
};

type Request = {
    title: string;
    message?: string;
    code?: string;
    buttons: DialogButton[];
    cancelable: boolean;
};

let enqueue: ((r: Request) => void) | null = null;

function extractCodeFromMessage(message?: string, explicitCode?: string): {
    cleanMessage?: string;
    code?: string;
} {
    if (explicitCode) {
        return { cleanMessage: message, code: explicitCode };
    }
    if (!message) {
        return { cleanMessage: undefined, code: undefined };
    }
    const recoveryMatch = message.match(/\b(?:[0-9A-F]{4}-){7,15}[0-9A-F]{4}\b/i);
    if (recoveryMatch) {
        const code = recoveryMatch[0];
        const cleanMessage = message.replace(code, '').replace(/\n{2,}/g, '\n').trim();
        return { cleanMessage, code };
    }
    const safetyMatch = message.match(/\b(?:[0-9A-F]{4}\s+){3,15}[0-9A-F]{4}\b/i);
    if (safetyMatch) {
        const code = safetyMatch[0].trim();
        const cleanMessage = message.replace(safetyMatch[0], '').replace(/\n{2,}/g, '\n').trim();
        return { cleanMessage, code };
    }
    return { cleanMessage: message, code: undefined };
}

export const dialog = {
    alert(
        title: string,
        message?: string,
        buttons: DialogButton[] = [{ text: 'OK' }],
        options?: DialogOptions,
    ) {
        const cancelable = options?.cancelable ?? true;
        if (!enqueue) {
            Alert.alert(title, message, buttons, { cancelable });
            return;
        }
        const { cleanMessage, code } = extractCodeFromMessage(message, options?.code);
        enqueue({ title, message: cleanMessage, code, buttons, cancelable });
    },
    confirm(
        title: string,
        message?: string,
        opts: { confirmText?: string; cancelText?: string; destructive?: boolean; code?: string } = {},
    ) {
        return new Promise<boolean>((resolve) => {
            dialog.alert(
                title,
                message,
                [
                    {
                        text: opts.cancelText ?? 'Cancel',
                        style: 'cancel',
                        onPress: () => resolve(false),
                    },
                    {
                        text: opts.confirmText ?? 'OK',
                        style: opts.destructive ? 'destructive' : 'default',
                        onPress: () => resolve(true),
                    },
                ],
                { cancelable: false, code: opts.code },
            );
        });
    },
};

export function DialogProvider({ children }: { children: ReactNode }) {
    const { colors } = useTheme();
    const [queue, setQueue] = useState<Request[]>([]);
    const [copied, setCopied] = useState(false);
    const handled = useRef<Request | null>(null);
    const current = queue[0];

    const progress = useSharedValue(0);
    const [shown, setShown] = useState<Request | undefined>();

    useEffect(() => {
        if (current) {
            setShown(current);
            setCopied(false);
            progress.value = 0;
            progress.value = withTiming(1, {
                duration: 180,
                easing: Easing.out(Easing.cubic),
            });
            return;
        }
        progress.value = withTiming(0, { duration: 120 });
        const t = setTimeout(() => setShown(undefined), 130);
        return () => clearTimeout(t);
    }, [current]);

    const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
    const cardStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        transform: [{ scale: interpolate(progress.value, [0, 1], [0.92, 1]) }],
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

    const handleCopy = async (codeText: string) => {
       // await Clipboard.setStringAsync(codeText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const content = shown && (
        <Pressable style={styles.backdrop} onPress={requestDismiss}>
            <Animated.View
                pointerEvents="none"
                style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: 'rgba(0, 0, 0, 0.68)' },
                    backdropStyle,
                ]}
            />
            <Animated.View style={[styles.cardWrap, cardStyle]}>
                <Pressable
                    onPress={() => {}}
                    accessibilityViewIsModal
                    style={[
                        styles.card,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Text style={[styles.title, { color: colors.text }]}>
                        {shown.title}
                    </Text>

                    {!!shown.message && (
                        <Text style={[styles.message, { color: colors.textMuted }]}>
                            {shown.message}
                        </Text>
                    )}

                    {!!shown.code && (
                        <View
                            style={[
                                styles.codeBox,
                                {
                                    backgroundColor: colors.background,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <Text
                                selectable
                                style={[styles.codeText, { color: colors.accent }]}
                            >
                                {shown.code}
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.copyBtn,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: copied ? colors.accent : colors.border,
                                    },
                                ]}
                                onPress={() => handleCopy(shown.code!)}
                                activeOpacity={0.75}
                            >
                                <Ionicons
                                    name={copied ? 'checkmark-circle' : 'copy-outline'}
                                    size={15}
                                    color={copied ? colors.accent : colors.text}
                                />
                                <Text
                                    style={[
                                        styles.copyBtnText,
                                        { color: copied ? colors.accent : colors.text },
                                    ]}
                                >
                                    {copied ? 'Copied to Clipboard' : 'Copy Code'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={shown.buttons.length > 2 ? styles.col : styles.row}>
                        {shown.buttons.map((b, i) => (
                            <View key={i} style={shown.buttons.length <= 2 && { flex: 1 }}>
                                <Button
                                    label={b.text}
                                    size="md"
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
                    animationType="fade"
                    statusBarTranslucent
                    onRequestClose={requestDismiss}
                >
                    {content}
                </Modal>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFill,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    cardWrap: {
        width: '100%',
        maxWidth: 360,
    },
    card: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 22,
        gap: 10,
    },
    title: {
        fontSize: 19,
        fontFamily: fonts.heading,
        fontWeight: '700',
    },
    message: {
        fontSize: 14,
        fontFamily: fonts.body,
        lineHeight: 20,
    },
    codeBox: {
        marginTop: 4,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        gap: 12,
    },
    codeText: {
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1,
        lineHeight: 20,
        textAlign: 'center',
    },
    copyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
    },
    copyBtnText: {
        fontSize: 12,
        fontFamily: fonts.label,
        fontWeight: '700',
    },
    row: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    col: {
        gap: 8,
        marginTop: 10,
    },
});