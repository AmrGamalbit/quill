import { fontSizes } from "@/src/constants/typography";
import useTheme from "@/src/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type MonthHeaderProps = { month: Date };
const formatter = new Intl.DateTimeFormat("en", { month: "long" });

export default function MonthHeader({ month }: MonthHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons name="arrow-back" size={20} color={colors.textMuted} />
      <Text style={[styles.text, { color: colors.text }]}>
        {formatter.format(month)}
      </Text>
      <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 10,
    flexDirection: "row",
  },
  text: {
    fontSize: fontSizes.md,
  },
});
