import { Text, View } from "react-native";
import useTheme from "../hooks/useTheme";

export default function Pill({ text }: { text: string }) {
  const { colors, spacing, radius, fonts } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.pillBackground,
        borderRadius: radius.md,
        padding: spacing.md,
      }}
    >
      <Text style={{ color: colors.pillText, fontFamily: fonts.label }}>
        {text}
      </Text>
    </View>
  );
}
