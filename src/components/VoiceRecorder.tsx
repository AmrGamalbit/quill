import { dialog } from "@/src/components/Dialog/DialogProvider";
import { Ionicons } from "@expo/vector-icons";
import {
  RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync,
  useAudioRecorder, useAudioRecorderState,
} from "expo-audio";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, SlideInDown, SlideOutDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import useTheme from "../hooks/useTheme";
import type { PendingAttachment } from "../services/attachments";
import { formatDuration } from "../utils/formatDuration";
import PressableScale, { IconButton } from "./PressableScale";

const OPTIONS = { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true };
const BARS = 36;

export default function VoiceRecorder({
    onDone, onCancel,
}: { onDone: (a: PendingAttachment) => void; onCancel: () => void }) {
    const { colors } = useTheme();
    const recorder = useAudioRecorder(OPTIONS);
    const state = useAudioRecorderState(recorder, 100);
    const [phase, setPhase] = useState<"starting" | "recording" | "paused">("starting");
    const [levels, setLevels] = useState<number[]>(() => Array(BARS).fill(0));
    const busy = useRef(false);

    const pulse = useSharedValue(1);
    const dotStyle = useAnimatedStyle(() => ({opacity: pulse.value}));

    useEffect(() => {
        pulse.value =
        phase === "recording"
        ? withRepeat(withSequence(withTiming(0.25, {duration: 600}), withTiming(1, {duration: 600})), -1)
        : withTiming(1);
    }, [phase]);

    useEffect(() => {
        let active = true;
        (async () => {
            const perm = await requestRecordingPermissionsAsync();
            if (!perm.granted) {
                dialog.alert("Microphone access needed", "Enable microphone permission in Settings to record voice notes.");
                onCancel();
                return;
            }
            await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
            await recorder.prepareToRecordAsync();
            if (!active) return;
            recorder.record();
            setPhase("recording");
            AccessibilityInfo.announceForAccessibility("Recording started");
        })().catch((e) => {
            console.error("Reocrder start failed:", e);
            dialog.alert("Couldn't start recording", e?.message ?? "Please try again.");
            onCancel();
        });

        return () => {
            active = false;
            setAudioModeAsync({allowsRecording: false, playsInSilentMode: true}).catch(() => {});
        };
    }, []);

    useEffect(() => {
        if (phase !== "recording") return;
        const n = Math.max(0, Math.min(1, ((state.metering ?? - 60) + 60) / 60));
        setLevels((l) => [...l.slice(1), n]);
    }, [state.durationMillis]);

    const togglePause = () => {
        if (phase === "recording") {
            recorder.pause();
            setPhase("paused");
            AccessibilityInfo.announceForAccessibility("Recording paused");
        } else if (phase === "paused") {
            recorder.record();
            setPhase("recording");
            AccessibilityInfo.announceForAccessibility("Recording resumed");
        }
    };

    const discard = async () => {
        if (busy.current) return;
        busy.current = true;
        try { await recorder.stop(); } catch{};
        onCancel();
    };

    const finish = async () => {
        if (busy.current || phase === "starting") return;
        busy.current = true;
        try {
            const durationMs = state.durationMillis;
            await recorder.stop();
            const uri = recorder.uri;
            if (!uri) throw new Error("No recording was produced.");
            const stamp = new Date().toLocaleString("en-us", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit"});
            onDone({
                kind: "audio",
                name: `Voice note ${stamp}`,
                uri,
                mimeType: "audio/mp4",
                width: null,
                height: null,
                durationMs,
                sizeBytes: null,
            });
        } catch (e: any) {
            busy.current = false;
            console.error("Recording stop failes: ", e);
            dialog.alert("Couldn't save recording", e?.message ?? "Please try again.");
        }
    };

    const time = formatDuration(state.durationMillis / 1000);

  return (
    <Animated.View
      entering={SlideInDown.duration(240).easing(Easing.out(Easing.cubic))}
      exiting={SlideOutDown.duration(200).easing(Easing.in(Easing.cubic))}
      accessibilityViewIsModal
      style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}
    >
      <View style={styles.topRow}>
        <Animated.View style={[styles.dot, { backgroundColor: colors.danger }, dotStyle]} />
        <Text
          accessibilityRole="timer"
          accessibilityLabel={`${phase === "paused" ? "Paused" : "Recording"}, ${time}`}
          style={[styles.time, { color: colors.text }]}
        >
          {time}
        </Text>
        <Text style={[styles.status, { color: colors.textMuted }]}>
          {phase === "paused" ? "Paused" : phase === "starting" ? "Getting ready…" : "Recording"}
        </Text>
      </View>

      <View style={styles.wave} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {levels.map((n, i) => (
          <View key={i} style={[styles.bar, { height: 4 + n * 36, backgroundColor: phase === "paused" ? colors.textMuted : colors.accent }]} />
        ))}
      </View>

      <View style={styles.controls}>
        <IconButton icon="trash-outline" label="Discard recording" onPress={discard} color={colors.danger} size={24} />
        <IconButton
          icon={phase === "paused" ? "mic" : "pause"}
          label={phase === "paused" ? "Resume recording" : "Pause recording"}
          onPress={togglePause}
          disabled={phase === "starting"}
          color={colors.text}
          size={26}
        />
        <PressableScale
          onPress={finish}
          disabled={phase === "starting"}
          borderless={false}
          scaleTo={0.9}
          accessibilityRole="button"
          accessibilityLabel="Stop and attach recording"
          style={[styles.done, { backgroundColor: colors.accent }, phase === "starting" && { opacity: 0.5 }]}
        >
          <Ionicons name="checkmark" size={28} color={colors.textOnAccent} />
        </PressableScale>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: { position: "absolute", left: 0, right: 0, bottom: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderBottomWidth: 0, padding: 20, gap: 16, elevation: 12, shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: -4 } },
  topRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  time: { fontSize: 22, fontWeight: "700", fontVariant: ["tabular-nums"] },
  status: { fontSize: 13, fontWeight: "500", marginLeft: "auto" },
  wave: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 44 },
  bar: { width: 4, borderRadius: 2 },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 },
  done: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", overflow: "hidden" },
});