import EmptyArt from "@/assets/images/empty.svg";
import DiaryCard from "@/src/components/DiaryCard";
import DiaryForm from "@/src/components/DiaryForm";
import FloatingActionButton from "@/src/components/FloatingActionButton";
import GreetingHeader from "@/src/components/GreetingHeader";
import SettingsModal from "@/src/components/SettingsModal";
import { spacing } from "@/src/constants/spacings";
import { fonts, fontSizes } from "@/src/constants/typography";
import { useUserSession } from "@/src/context/UserSessionContext";
import useDiaries from "@/src/hooks/useDiaries";
import useTheme from "@/src/hooks/useTheme";
import useUserEmail from "@/src/hooks/useUserEmail";
import type { DiaryFormData } from "@/src/types/diary";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
  const router = useRouter();

  const handleAddDiary = (data: DiaryFormData) => {
    if (!data.name.trim()) return;
    addDiary(data.name.trim(), "");
    setShowDiaryForm(false);
  };

  const handleDeleteDiary = async (id: number) => {
    await deleteDiary(id);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.screen}>
        <FlatList
        numColumns={2}
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
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <DiaryCard
                diary={item}
                entryCount={item.entryCount}
                latestEntryBody={item.latestEntryBody}
                onPress={() => {
                  router.push(`/(app)/diary/${item.id}`);
                }}
                onDelete={(id) => handleDeleteDiary(id)}
              />
            </View>
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

const getStyles = (colors: any) =>
  StyleSheet.create({
    screen: { flex: 1 },
    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: 96,
    },
    cell: {
      width: '50%',
      padding: spacing.xs,
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
