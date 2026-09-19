import { Pressable, StyleSheet, Text } from "react-native";
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacings";
import { fonts } from "../constants/typography";
import useTheme from "../hooks/useTheme";

type buttonProps = {
  label: string;
  onPress: () => void;
};
export default function Button({ label, onPress }: buttonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      style={[styles.buttonContainer, { backgroundColor: colors.accent }]}
      onPress={onPress}
    >
      <Text style={[styles.buttonLabel, { color: colors.textOnAccent }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  buttonLabel: {
    fontFamily: fonts.label,
  },
});
