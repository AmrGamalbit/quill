import { requireOptionalNativeModule } from "expo";
import * as Haptics from "expo-haptics";

export type HapticEvent = {
  type: "transient" | "continuous";
  time: number;
  duration?: number;
  intensity: number;
  endIntensity?: number;
  sharpness?: number;
};

const Native = requireOptionalNativeModule("HapticEngine");
let enabled = true;
export const setHapticsEnabled = (v: boolean) => {
  enabled = v;
  if (!v) cancel();
};

export function play(events: HapticEvent[]) {
  if (!enabled) return;
  if (Native?.isSupported()) {
    Native.play(events);
    return;
  }

  const peak = Math.max(...events.map((e) => e.intensity));
  Haptics.impactAsync(
    peak > 0.75
      ? Haptics.ImpactFeedbackStyle.Rigid
      : peak > 0.4
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light,
  ).catch(() => {});
}

export const cancel = () => Native?.cancel();
