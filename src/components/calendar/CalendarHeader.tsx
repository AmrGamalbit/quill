import { fontSizes } from "@/src/constants/typography";
import useTheme from "@/src/hooks/useTheme";
import { StyleSheet, Text, View } from "react-native";
import NavButton from "./NavButton";

type MonthHeaderProps = {
  month: Date;
  onPrev: () => void;
  onNext: () => void;
  onTitlePress: () => void;
};
const formatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "long",
});

export default function MonthHeader({
  month,
  onPrev,
  onNext,
  onTitlePress,
}: MonthHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <NavButton icon="arrow-back" onPress={onPrev} />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Text
          style={[styles.text, { color: colors.text }]}
          maxFontSizeMultiplier={1.2}
        >
          {formatter.format(month)}
        </Text>
        <NavButton icon="chevron-down" iconSize={16} onPress={onTitlePress} />
      </View>
      <NavButton icon="arrow-forward" onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 10,
    flexDirection: "row",
    height: 48,
  },
  text: {
    fontSize: fontSizes.md,
  },
  ionButton: { padding: 2, borderRadius: 999 },
});
