import { useEffect, useRef } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
    Easing, Extrapolation, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withDelay, withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts, fontSizes } from "../constants/typography";
import type { CardRect } from "../context/DiaryTransitionContext";
import useTheme from "../hooks/useTheme";
import { fx, T } from "../services/diaryFx";
import type { Diary } from "../types/diary";
import DiaryBook from "./DiaryBook";

const SLIDE_DX = 18;
const PERSPECTIVE = 900;
// Must match EntriesList topBar: paddingHorizontal 20 + close btn 30 + gap 12; paddingVertical 12; heading 20
const HEADING_X = 62;
const HEADING_TOP = 12;
const HEADING_SIZE = 20;

const OPEN_FLIP = T.slide;
const OPEN_LAND = OPEN_FLIP + T.flip;
const OPEN_GROW = OPEN_LAND + T.hold;
const OPEN_COVERED = OPEN_GROW + T.grow;
const FORCE_REVEAL = 1500; // reveal anyway if the diary screen never reports ready

const CLOSE_MID = T.grow * 0.35;
const CLOSE_FLIP = T.grow + T.hold;
const CLOSE_SLIDE = CLOSE_FLIP + T.flip;
const CLOSE_END = CLOSE_SLIDE + T.slide;

type Props = {
  mode: "open" | "close";
  diary: Diary;
  origin: CardRect; // the card slot on Home
  ready: boolean; // open: diary screen has rendered
  onMid: () => void; // navigate
  onDone: () => void;
};

export default function DiaryOpenOverlay({ mode, diary, origin, ready, onMid, onDone }: Props) {
  const opening = mode === "open";
  const { colors } = useTheme();
  const { top: inset } = useSafeAreaInsets();
  const { width: sw, height: sh } = useWindowDimensions();
  const { x: ox, y: oy, width: ow, height: oh, title } = origin;
  const { x: tx, y: ty } = title;
  const endY = inset + HEADING_TOP;
  const startSize = fontSizes.lg;
  const from = colors.cardPressed;
  const to = colors.background;

  const slide = useSharedValue(opening ? 0 : 1);
  const flip = useSharedValue(opening ? 0 : 1);
  const grow = useSharedValue(opening ? 0 : 1);
  const fade = useSharedValue(0); // root opacity = 1 - fade (open only)

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const covered = useRef(false);
  const forced = useRef(false);
  const revealed = useRef(false);
  const readyRef = useRef(ready);
  readyRef.current = ready;
  const at = (ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  };
  const inOut = Easing.inOut(Easing.cubic);

  const tryReveal = () => {
    if (revealed.current || !covered.current || !(readyRef.current || forced.current)) return;
    revealed.current = true;
    fade.value = withTiming(1, { duration: T.reveal });
    at(T.reveal, onDone);
  };

  useEffect(() => {
    if (opening) {
      slide.value = withTiming(1, { duration: T.slide, easing: Easing.out(Easing.cubic) });
      flip.value = withDelay(OPEN_FLIP, withTiming(1, { duration: T.flip, easing: inOut }));
      grow.value = withDelay(OPEN_GROW, withTiming(1, { duration: T.grow, easing: inOut }));
      fx.openSlide();
      at(OPEN_LAND, fx.land);
      at(OPEN_GROW, fx.grow);
      at(OPEN_COVERED, () => {
        covered.current = true;
        onMid();
        tryReveal();
      });
      at(OPEN_COVERED + FORCE_REVEAL, () => {
        forced.current = true;
        tryReveal();
      });
    } else {
      grow.value = withTiming(0, { duration: T.grow, easing: inOut });
      flip.value = withDelay(CLOSE_FLIP, withTiming(0, { duration: T.flip, easing: inOut }));
      slide.value = withDelay(CLOSE_SLIDE, withTiming(0, { duration: T.slide, easing: Easing.in(Easing.cubic) }));
      fx.shrink();
      at(CLOSE_MID, onMid);
      at(CLOSE_END - T.closeClick, fx.clickSound);
      at(CLOSE_END, fx.click);
      at(CLOSE_END + 30, onDone);
    }
    return () => {
      timers.current.forEach(clearTimeout);
      fx.cancel();
    };
  }, []);

  useEffect(() => {
    if (opening && ready) at(T.settle, tryReveal);
  }, [ready]);

  const root = useAnimatedStyle(() => ({ opacity: 1 - fade.value }));
  const box = useAnimatedStyle(() => {
    const g = grow.value;
    return {
      left: interpolate(g, [0, 1], [ox + slide.value * SLIDE_DX, 0]),
      top: interpolate(g, [0, 1], [oy, 0]),
      width: interpolate(g, [0, 1], [ow, sw]),
      height: interpolate(g, [0, 1], [oh, sh]),
    };
  });
  const titleStyle = useAnimatedStyle(() => {
    const g = grow.value;
    return {
      left: interpolate(g, [0, 1], [tx + slide.value * SLIDE_DX, HEADING_X]),
      top: interpolate(g, [0, 1], [ty, endY]),
      fontSize: interpolate(g, [0, 1], [startSize, HEADING_SIZE]),
    };
  });
  const front = useAnimatedStyle(() => ({
    transform: [{ perspective: PERSPECTIVE }, { rotateX: `${flip.value * 180}deg` }],
  }));
  const cover = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(grow.value, [0, 1], [from, to]),
    borderRadius: interpolate(grow.value, [0, 1], [6, 0]),
    // closing: starts see-through so the diary screen stays visible, solid by halfway
    opacity: opening ? 1 : interpolate(grow.value, [1, 0.5], [0, 1], Extrapolation.CLAMP),
    transform: [{ perspective: PERSPECTIVE }, { rotateX: `${180 + flip.value * 180}deg` }],
  }));

  const base = opening
    ? { left: ox, top: oy, width: ow, height: oh }
    : { left: 0, top: 0, width: sw, height: sh };

  return (
    <Animated.View style={[styles.root, root]}>
      <Animated.View style={[styles.box, base, box]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.face, front]}>
          <DiaryBook diary={diary} backgroundColor={colors.card} hideTitle />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, styles.face, cover]} />
      </Animated.View>
      <Animated.Text
        numberOfLines={1}
        style={[
          styles.title,
          { color: colors.text, left: opening ? tx : HEADING_X, top: opening ? ty : endY, fontSize: opening ? startSize : HEADING_SIZE },
          titleStyle,
        ]}
      >
        {diary.name}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill }, // also swallows taps while animating
  box: { position: "absolute" },
  face: { backfaceVisibility: "hidden" },
  title: { position: "absolute", fontFamily: fonts.heading, fontWeight: "600" },
});