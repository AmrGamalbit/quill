import { Pressable, StyleSheet, Text, View } from "react-native";
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacings";
import useTheme from "../hooks/useTheme";

type Option = { label: string; value: string };
type SegmentedControlProps = {
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
};
export default function SegmentedControl({
  options,
  selectedValue,
  onSelect,
}: SegmentedControlProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.SegmentedControl,
          borderColor: colors.border,
        },
      ]}
    >
      {options.map((o) => {
        const backgroundColor =
          o.value == selectedValue ? colors.card : "transparent";
        const color = o.value == selectedValue ? colors.text : colors.textMuted;

        return (
          <Pressable
            key={o.value}
            onPress={() => onSelect(o.value)}
            style={[
              styles.segment,
              {
                backgroundColor,
              },
            ]}
          >
            <Text style={{ color }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    padding: spacing.xs,
    borderWidth: 1,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
  },
});
