import EmptyArt from "@/assets/images/empty.svg";
import DiaryCard from "@/src/components/DiaryCard";
import DiaryForm from "@/src/components/DiaryForm";
import FloatingActionButton from "@/src/components/FloatingActionButton";
import GreetingHeader from "@/src/components/GreetingHeader";
import SettingsModal from "@/src/components/SettingsModal";
import { spacing } from "@/src/constants/spacings";
import { fonts, fontSizes } from "@/src/constants/typography";
import useDiaries from "@/src/hooks/useDiaries";
import useTheme from "@/src/hooks/useTheme";
import useUserEmail from "@/src/hooks/useUserEmail";
import type { DiaryFormData } from "@/src/types/diary";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showDiaryForm, setShowDiaryForm] = useState(false);

  const email = useUserEmail();
  const { diaries, deleteDiary, addDiary } = useDiaries();
  const router = useRouter();

  const handleAddDiary = async (data: DiaryFormData) => {
    const trimmed = data.name.trim();
    if (!trimmed) return;
    await addDiary(trimmed, data.description.trim());
    setShowDiaryForm(false);
  };

  const handleDeleteDiary = async (id: string) => {
    await deleteDiary(Number(id));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerTextGroup}>
              <GreetingHeader name="Alex" />
              {/*   <DatePill /> */}
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setIsSettingsOpen(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={styles.settingsIconColor.color}
              />
            </TouchableOpacity>
          </View>
          <FlatList
            data={diaries}
            keyExtractor={(item) => item.id}
            contentContainerStyle={
              diaries.length === 0 ? styles.emptyContainer : undefined
            }
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
              <DiaryCard
                diary={item}
                entryCount={item.entryCount}
                latestEntryBody={item.latestEntryBody}
                onPress={() => {
                  router.push(`/(app)/diary/${item.id}`);
                }}
                onDelete={(id) => handleDeleteDiary(id)}
              />
            )}
          />
        </View>

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
    content: { padding: spacing.lg, flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    headerTextGroup: {
      flex: 1,
    },
    settingsButton: {
      padding: 6,
      borderRadius: 20,
      marginTop: 4,
    },
    settingsIconColor: {
      color: "#62726E",
    },
    emptyList: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    emptyContainer: {
      flexGrow: 1, // Crucial: lets the scroll surface expand to fill the full height
      justifyContent: "center",
      alignItems: "center",
    },
    noDiaryText: {
      fontSize: fontSizes.xl,
      fontWeight: "600",
      fontFamily: fonts.label,
      color: colors.text,
    },
  });
