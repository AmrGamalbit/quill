import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

const ATTACHMENT_KIND_ICONS = [
  { kind: "image" as const, icon: "image-outline" as const, label: "Image" },
  { kind: "video" as const, icon: "videocam-outline" as const, label: "Video" },
  { kind: "audio" as const, icon: "mic-outline" as const, label: "Audio" },
];

type kind = "image" | "audio" | "video";
type AttachmentSummaryProps = { counts: Record<kind, number> };

export default function AttachmentSummary({ counts }: AttachmentSummaryProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.row}>
      {ATTACHMENT_KIND_ICONS.map(({ kind, icon, label }) => {
        return counts[kind] > 0 ? (
          <View style={styles.item} key={kind}>
            <Ionicons
              name={icon}
              color={colors.textMuted}
              size={16}
              accessibilityLabel={`${label} icon`}
            />
            <Text style={styles.count}>{counts[kind]}</Text>
          </View>
        ) : null;
      })}
    </View>
  );
}

const getStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    count: {
      fontSize: 12,
      fontWeight: "500",
      fontVariant: ["tabular-nums"],
      color: colors.textMuted,
    },
  });
