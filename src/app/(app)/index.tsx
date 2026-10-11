import EmptyArt from "@/assets/images/empty.svg";
import DiaryCard, { STACK_SIDE_PADDING } from "@/src/components/DiaryCard";
import DiaryForm from "@/src/components/DiaryForm";
import FloatingActionButton from "@/src/components/FloatingActionButton";
import GreetingHeader from "@/src/components/GreetingHeader";
import SettingsModal from "@/src/components/SettingsModal";
import { spacing } from "@/src/constants/spacings";
import { fonts, fontSizes } from "@/src/constants/typography";
import { useDiaryTransition } from "@/src/context/DiaryTransitionContext";
import { useUserSession } from "@/src/context/UserSessionContext";
import useDiaries from "@/src/hooks/useDiaries";
import useTheme from "@/src/hooks/useTheme";
import useUserEmail from "@/src/hooks/useUserEmail";
import type { DiaryFormData } from "@/src/types/diary";
import { Stack } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const { colors } = useTheme();
  const { session } = useUserSession();
  const styles = getStyles(colors);

  const firstName = session?.name
    ? session.name.trim().split(" ")[0]
    : "Friend";

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showDiaryForm, setShowDiaryForm] = useState(false);

  const email = useUserEmail();
  const { diaries, deleteDiary, addDiary } = useDiaries();
  const { open } = useDiaryTransition();

  const handleAddDiary = (data: DiaryFormData) => {
    const name = data.name.trim();
    if (!name) return;
    addDiary(name, data.color).catch((e) =>
      console.error("Failed to create diary: ", e),
    );
    setShowDiaryForm(false);
  };

  const handleDeleteDiary = async (id: number) => {
    deleteDiary(id).catch((e) => console.error("Failed to delete diary: ", e));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen options={{ animation: "none" }} />
      <View style={styles.screen}>
        <FlatList
          data={diaries}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={<GreetingHeader name={firstName} photoUri={session?.photoUri} onAvatarPress={() => setIsSettingsOpen(true)} />}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <EmptyArt width={220} height={220} />
              <Text style={styles.noDiaryText}>No Diaries Yet.</Text>
              <Text style={{ color: colors.textMuted }}>
                Join or create a new one.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <DiaryCard
              diary={item}
              isFirst={index === 0}
              onPress={(origin) => open(item, origin)}
              onDelete={handleDeleteDiary}
            />
          )}
        />
        <DiaryForm
          isOpen={showDiaryForm}
          onClose={() => setShowDiaryForm(false)}
          onSubmit={handleAddDiary}
        />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          userEmail={email}
        />
        <FloatingActionButton
          onPress={() => {
            setShowDiaryForm(true);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    screen: { flex: 1 },
    listContent: {
      paddingHorizontal: STACK_SIDE_PADDING,
      paddingBottom: 96,
    },
    emptyList: {
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: spacing.xl,
    },
    noDiaryText: {
      fontSize: fontSizes.xl,
      fontWeight: "600",
      fontFamily: fonts.label,
      color: colors.text,
    },
  });