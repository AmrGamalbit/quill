import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacings";
import { fontSizes, fonts } from "../constants/typography";
import useTheme from "../hooks/useTheme";
import FormField from "./FormField";

type DiaryFormProps = { onClose: () => void; onSubmit: (data) => void };
export default function DiaryForm({ onClose, onSubmit }: DiaryFormProps) {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({ name: "", description: "" });

  const handleSubmit = () => {
    onSubmit(formData);
    console.log("submitted");
    onClose();
  };

  return (
    <View style={[styles.modal, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Add a Diary</Text>
      <View style={{ padding: 10, marginVertical: 10, gap: spacing.md }}>
        <FormField
          label="Title"
          value={formData.name}
          onChangeText={(newText) =>
            setFormData((prevData) => ({ ...prevData, name: newText }))
          }
        />
        <FormField
          label="Description"
          value={formData.description}
          onChangeText={(newText) =>
            setFormData((prevData) => ({ ...prevData, description: newText }))
          }
        />
        <Pressable
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={handleSubmit}
        >
          <Text style={{ color: colors.textOnAccent }}>Create</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modal: { width: "100%", padding: spacing.xl },
  title: { fontSize: fontSizes.lg, fontFamily: fonts.label },
  button: {
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.sm,
  },
});
