import { Text, View } from "react-native";
import useTheme from "../hooks/useTheme";

export default function GreetingHeader({ name }: { name: string }) {
  const { colors, fonts, fontSizes, spacing } = useTheme();

  const hour = new Date().getHours();
  const salutation =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <View>
      <Text
        style={{
          color: colors.text,
          fontFamily: fonts.heading,
          fontSize: fontSizes.xxl,
        }}
      >
        {salutation}, {name}.
      </Text>
      <Text style={{ marginVertical: spacing.md, color: colors.textMuted }}>
        What's on your mind today?
      </Text>
    </View>
  );
}