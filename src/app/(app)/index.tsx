import DatePill from "@/src/components/DatePill";
import DiaryCard from "@/src/components/DiaryCard";
import DiaryForm from "@/src/components/DiaryForm";
import FloatingActionButton from "@/src/components/FloatingActionButton";
import GreetingHeader from "@/src/components/GreetingHeader";
import { spacing } from "@/src/constants/spacings";
import type { Diary, DiaryFormData } from "@/src/types/diary";
import { getAllDiaries, saveDiary } from "@/src/utils/db";
import { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [showDiaryForm, setShowDiaryForm] = useState(false);

  useEffect(() => {
    const result = getAllDiaries();
    setDiaries(result);
  }, []);

  const handleAddDiary = (data: DiaryFormData) => {
    // const createdAt = new Date().toString();
    // const newDiary = {
    //   id: createdAt,
    //   name: data.name,
    //   members: ["You"],
    //   createdAt: createdAt,
    //   lastOpenedAt: createdAt,
    //   entries: [],
    // };
    const newDiary = saveDiary(data.name, data.description);
    setDiaries((prevDiaries) => [...prevDiaries, newDiary]);
  };

  const handleDeleteDiary = (id: string) => {
    setDiaries((prevDiaries) => [...prevDiaries.filter((d) => d.id != id)]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.header}>
            <GreetingHeader name="Alex" />
            <DatePill />
          </View>
          <FlatList
            data={diaries}
            renderItem={({ item, index }) => (
              <DiaryCard
                key={index}
                diary={item}
                onDelete={(id) => handleDeleteDiary(id)}
              />
            )}
          />
        </View>
        <Modal
          visible={showDiaryForm}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDiaryForm(false)}
        >
          <Pressable
            style={styles.overlay}
            onPress={() => setShowDiaryForm(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS == "ios" ? "padding" : "height"}
            >
              <Pressable onPress={(e) => e.stopPropagation()}>
                <DiaryForm
                  onClose={() => {
                    setShowDiaryForm(false);
                  }}
                  onSubmit={(data) => handleAddDiary(data)}
                />
              </Pressable>
            </KeyboardAvoidingView>
          </Pressable>
        </Modal>
        <FloatingActionButton
          onPress={() => {
            setShowDiaryForm(true);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
});
