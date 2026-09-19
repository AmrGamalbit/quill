import DatePill from "@/src/components/DatePill";
import DiaryCard from "@/src/components/DiaryCard";
import DiaryForm from "@/src/components/DiaryForm";
import FloatingActionButton from "@/src/components/FloatingActionButton";
import GreetingHeader from "@/src/components/GreetingHeader";
import useTheme from "@/src/hooks/useTheme";
import type { Diary } from "@/src/types/diary";
import { useState } from "react";
import { FlatList, Modal, Pressable, View } from "react-native";

export default function Home() {
  const { spacing } = useTheme();
  const [diaries, setDiaries] = useState<Diary[]>([
    {
      id: "1",
      name: "France Holiday",
      members: ["Sam", "Alex", "Carol", "Jamie"],
      createdAt: "2026-09-01T08:00:00Z",
      lastOpenedAt: "2026-09-15T09:00:00Z",
      entries: [
        {
          id: "e1",
          title: "Paris",
          body: "We got up before sunrise because Sam insisted the light over the old town would be worth it, and honestly, standing on that hill with the whole coastline turning gold beneath us, I couldn't argue.",
          author: "Sam",
          createdAt: "2026-09-16T06:30:00Z",
        },
        {
          id: "e2",
          title: "Lyon",
          body: "Quiet day, mostly just walked around and ate too much. Found a small bookshop that Carol refused to leave for an hour.",
          author: "Carol",
          createdAt: "2026-09-15T20:00:00Z",
        },
        {
          id: "e3",
          title: "Nice",
          body: "The water was colder than expected. Worth it anyway.",
          author: "Alex",
          createdAt: "2026-09-14T18:00:00Z",
        },
      ],
    },
    {
      id: "2",
      name: "Just Me",
      members: ["Alex"],
      createdAt: "2026-08-20T08:00:00Z",
      lastOpenedAt: "2026-09-17T09:00:00Z",
      entries: [
        {
          id: "e4",
          title: "A quiet Tuesday",
          body: "Nothing much happened today, but I wanted to write it down anyway. Sometimes the ordinary days are the ones worth remembering most.",
          author: "Alex",
          createdAt: "2026-09-17T21:00:00Z",
        },
      ],
    },
  ]);
  const [showDiaryForm, setShowDiaryForm] = useState(false);

  const handleAddDiary = (data) => {
    const createdAt = new Date().toString();
    setDiaries((prevDiaries) => [
      ...prevDiaries,
      {
        id: createdAt,
        name: data.name,
        members: ["You"],
        createdAt: createdAt,
        entries: [],
      },
    ]);
  };
  return (
    <>
      <View style={{ padding: spacing.lg }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <GreetingHeader name="Alex" />
          <DatePill />
        </View>
        <FlatList
          data={diaries}
          renderItem={({ item, index }) => (
            <DiaryCard key={index} diary={item} />
          )}
        />
        <Modal
          visible={showDiaryForm}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDiaryForm(false)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              justifyContent: "flex-end",
            }}
            onPress={() => setShowDiaryForm(false)}
          >
            <DiaryForm
              onClose={() => {
                setShowDiaryForm(false);
              }}
              onSubmit={(data) => handleAddDiary(data)}
            />
          </Pressable>
        </Modal>
        <FloatingActionButton
          onPress={() => {
            setShowDiaryForm(true);
          }}
        />
      </View>
    </>
  );
}
