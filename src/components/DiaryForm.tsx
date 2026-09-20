import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { spacing } from "../constants/spacings";
import { fontSizes, fonts } from "../constants/typography";
import useTheme from "../hooks/useTheme";
import type { DiaryFormData } from "../types/diary";
import Button from "./Button";
import FormField from "./FormField";

type DiaryFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DiaryFormData) => void;
};

export default function DiaryForm({ isOpen, onClose, onSubmit }: DiaryFormProps) {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({ name: "", description: "" });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    onSubmit(formData);
    console.log("submitted");
    onClose();
  };

  return (
    <Modal
    visible={isOpen}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
    >
      <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardContainer}
      >
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, {backgroundColor: colors.surface }]}>
        <View style={styles.handleIndicator} />
        <Text style={[styles.title, {color: colors.text}]}>New Diary</Text>
        <View style={styles.formContent}>
          <FormField
          label="Title"
          placeholder="Personal, Work, Travel"
          value={formData.name}
          onChangeText={(newText) => 
            setFormData((prev) => ({ ...prev, name: newText}))
          }
          />
          <Button label="Create Diary" onPress={handleSubmit} />
        </View>
      </View>
    </View>
    </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  handleIndicator: {
    width: 36,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heading,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  formContent: {
    gap: spacing.md,
  },
  modal: { width: "100%", padding: spacing.xl, },
});
