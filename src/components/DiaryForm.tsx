import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { spacing } from "../constants/spacings";
import { fontSizes, fonts } from "../constants/typography";
import useTheme from "../hooks/useTheme";
import type { DiaryFormData } from "../types/diary";
import Button from "./Button";
import FormField from "./FormField";

type DiaryFormProps = {
  onClose: () => void;
  onSubmit: (data: DiaryFormData) => void;
};

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
        <Button label="Create" onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modal: { width: "100%", padding: spacing.xl },
  title: { fontSize: fontSizes.lg, fontFamily: fonts.label },
});
