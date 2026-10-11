import { Ref } from "react";
import { Animated, ColorValue, StyleSheet, Text, View } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { resolveDiaryColor } from "../constants/colors";
import { spacing } from "../constants/spacings";
import { fontSizes, fonts } from "../constants/typography";
import useTheme from "../hooks/useTheme";
import type { Diary } from "../types/diary";

const SPINE_WIDTH = 12;
const RIBBON_HEIGHT = 16;
const RIBBON_LENGTH = 44;
const RIBBON_NOTCH = 7;
export const RIBBON_OVERHANG = 14;
export const BOOK_HEIGHT = 72;

type Props = {
    diary: Diary;
    backgroundColor: Animated.WithAnimatedValue<ColorValue>;
    titleRef?: Ref<Text>;
    hideTitle?: boolean;
};

export default function DiaryBook({ diary, backgroundColor, titleRef, hideTitle }: Props) {
    const { colors, isDark } = useTheme();
    const ribbonColor = resolveDiaryColor(diary.color, isDark ? "dark" : "light");
    const entryLabel = `${diary.entryCount} ${diary.entryCount === 1 ? "entry" : "entries"}`;

    return (
        <Animated.View
        style={[styles.book, {height: BOOK_HEIGHT, borderColor: colors.border, backgroundColor }]}
        >
            <View style={[styles.spine, { backgroundColor: colors.border }]} />
            <View style={styles.labels}>
                <Text ref={titleRef} numberOfLines={1} style={[styles.title, { color: colors.text }, hideTitle && {opacity: 0}]}>
                    {diary.name}
                </Text>
                <Text style={[styles.count, { color: colors.textMuted }]}>{entryLabel}</Text>
            </View>
            <Svg
            width={RIBBON_LENGTH}
            height={RIBBON_HEIGHT}
            style={[styles.ribbon, { right: -RIBBON_OVERHANG, top: (BOOK_HEIGHT - RIBBON_HEIGHT) / 2}]}
            >
                <Polygon
                points={`0,0 ${RIBBON_LENGTH},0 ${RIBBON_LENGTH - RIBBON_NOTCH},${RIBBON_HEIGHT / 2} ${RIBBON_LENGTH},${RIBBON_HEIGHT} 0,${RIBBON_HEIGHT}`}
                fill={ribbonColor}
                />
            </Svg>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    book: {
        flexDirection: "row",
        borderWidth: 1,
        borderRadius: 6
    },
    spine: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        width: SPINE_WIDTH,
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
    },
    labels: {
        flex: 1,
        justifyContent: "center",
        paddingLeft: SPINE_WIDTH + spacing.md,
        paddingRight: RIBBON_LENGTH - RIBBON_OVERHANG + spacing.sm,
    },
    title: {
        fontSize: fontSizes.lg,
        fontFamily: fonts.heading,
        fontWeight: "600",
    },
    count: {
        fontSize: fontSizes.sm,
        fontFamily: fonts.label,
        marginTop: spacing.xs,
    },
    ribbon: {
        position: "absolute",
        pointerEvents: "none"
    },
})