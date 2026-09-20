import { Text, View } from "react-native";
import useTheme from "../hooks/useTheme";

export default function GreetingHeader({ name }: { name: string }) {
  const { colors, fonts, fontSizes, spacing } = useTheme();
  return (
    <View>
      <Text
        style={{
          color: colors.text,
          fontFamily: fonts.heading,
          fontSize: fontSizes.xl,
        }}
      >
        Good Morning, {name}.
      </Text>
      <Text style={{ marginVertical: spacing.md, color: colors.textMuted }}>
        What's on your mind today?
      </Text>
    </View>
  );
}
