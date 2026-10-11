import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  DEFAULT_DIARY_COLOR,
  diaryColors,
  resolveDiaryColor,
  type DiaryColorKey,
} from "../constants/colors";
import { spacing } from "../constants/spacings";
import { fontSizes, fonts } from "../constants/typography";
import useTheme from "../hooks/useTheme";
import { haptic } from "../services/haptics";
import type { DiaryFormData } from "../types/diary";
import Button from "./Button";
import FormField from "./FormField";

type DiaryFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DiaryFormData) => void;
};

const COLOR_KEYS = Object.keys(diaryColors) as DiaryColorKey[];
const EMPTY_FORM: DiaryFormData = { name: "", color: DEFAULT_DIARY_COLOR};

export default function DiaryForm({ isOpen, onClose, onSubmit }: DiaryFormProps) {
  const { colors, isDark } = useTheme();
  const [formData, setFormData] = useState<DiaryFormData>(EMPTY_FORM);
  const scheme = isDark ? "dark" : "light";

  const close = () => {
    setFormData(EMPTY_FORM);
    onClose();
  }

  const handleSubmit = () => {
    const name = formData.name.trim();
    if (!name) return;
    onSubmit({name, color: formData.color});
    close();
  }

  return (
    <Modal
    visible={isOpen}
    animationType="slide"
    transparent={true}
    onRequestClose={close}
    >
      <KeyboardAvoidingView
      behavior={"padding"}
      style={styles.keyboardContainer}
      >
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={close} />
      <View style={[styles.sheet, {backgroundColor: colors.surface }]}>
        <View style={[styles.handleIndicator, {backgroundColor: colors.border}]} />
        <Text style={[styles.title, {color: colors.text}]}>New Diary</Text>
        <View style={styles.formContent}>
          <FormField
          label="Title"
          placeholder="Family, Friends, etc."
          value={formData.name}
          onChangeText={(name) => 
            setFormData((prev) => ({ ...prev, name}))
          }
          />

          <View style={styles.colorSection}>
            <Text style={{color: colors.textMuted}}>Ribbon color</Text>
            <View style={styles.swatchRow}>
              {COLOR_KEYS.map((key) => {
                const selected = key === formData.color;
                return (
                  <Pressable
                  key={key}
                  accessibilityRole="radio"
                  accessibilityState={{selected}}
                  accessibilityLabel={key}
                  hitSlop={4}
                  onPress={() => {
                    haptic.select();
                    setFormData((prev) => ({ ...prev, color: key }));
                  }}
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: resolveDiaryColor(key, scheme),
                      borderColor: selected ? colors.text : "transparent",
                    },
                  ]}
                  />
                );
              })}
            </View>
          </View>
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
  colorSection: {
    gap: spacing.sm,
  },
  swatchRow: {
    flexDirection: "row", flexWrap: "wrap", gap: "spacing.sm",
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3
  },
});
