import { fontSizes } from "@/src/constants/typography";
import useTheme from "@/src/hooks/useTheme";
import { StyleSheet, Text, View } from "react-native";
import NavButton from "./NavButton";

type MonthHeaderProps = {
  month: number;
  onPrev: () => void;
  onNext: () => void;
};
const formatter = new Intl.DateTimeFormat("en", { month: "long" });

export default function MonthHeader({
  month,
  onPrev,
  onNext,
}: MonthHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <NavButton icon="arrow-back" onPress={onPrev} />
      <Text
        style={[styles.text, { color: colors.text }]}
        maxFontSizeMultiplier={1.2}
      >
        {formatter.format(new Date(2026, month, 1))}
      </Text>
      <NavButton icon="arrow-forward" onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-around",
    marginVertical: 10,
    flexDirection: "row",
    height: 48,
  },
  text: {
    fontSize: fontSizes.md,
  },
  ionButton: { padding: 2, borderRadius: 999 },
});
