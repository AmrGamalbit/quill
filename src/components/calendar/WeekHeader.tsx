import { fontSizes } from "@/src/constants/typography";
import useTheme from "@/src/hooks/useTheme";
import { getWeekHeaders } from "@/src/utils/dates";
import { StyleSheet, Text, View } from "react-native";

type WeekHeaderProp = { weekStartOn: number };
export default function WeekHeader({ weekStartOn }: WeekHeaderProp) {
  const { colors } = useTheme();
  const headers = getWeekHeaders(weekStartOn);
  return (
    <View style={[styles.container]}>
      {headers.map((header) => {
        return (
          <View key={header} style={styles.cell}>
            <Text
              style={[styles.text, { color: colors.textMuted }]}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {header}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cell: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: {
    textTransform: "uppercase",
    overflow: "visible",
    fontSize: fontSizes.xs,
    fontWeight: 600,
  },
});
