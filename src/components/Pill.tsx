import { Text, View } from "react-native";
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacings";
import useTheme from "../hooks/useTheme";

export default function Pill({ text }: { text: string }) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.SegmentedControl,
        borderRadius: radius.md,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: colors.accent, fontWeight: 600 }}>{text}</Text>
    </View>
  );
}
