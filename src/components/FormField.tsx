import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import useTheme from "../hooks/useTheme";

type FormFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
};
export default function FormField({
  label,
  value,
  placeholder,
  onChangeText,
}: FormFieldProps) {
  const { colors } = useTheme();
  const styles = getStyles(Platform.OS === "ios");

  return (
    <View style={styles.container}>
      <Text style={{ color: colors.textMuted }}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
      ></TextInput>
    </View>
  );
}

const getStyles = (isIos: boolean) => StyleSheet.create({
  container: { gap: 8 },
  input: {
    height: isIos ? 32 : 'auto',
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
});
