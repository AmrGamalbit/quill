import useTheme from "@/src/hooks/useTheme";
import { getWeekHeaders } from "@/src/utils/dates";
import { StyleSheet, Text, View } from "react-native";

type WeekHeaderProp = { weekStartOn: number };

export default function WeekHeader({ weekStartOn }: WeekHeaderProp) {
  const { colors } = useTheme();
  const headers = getWeekHeaders(weekStartOn);
  return (
    <View style={styles.container}>
      {headers.map((header) => {
        return (
          <Text
            key={header}
            style={[styles.text, { color: colors.textMuted }]}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {header}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-around",
    margin: 5,
  },
  text: {
    textTransform: "uppercase",
    overflow: "visible",
  },
});
