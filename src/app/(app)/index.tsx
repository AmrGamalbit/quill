import DatePill from "@/src/components/DatePill";
import DiaryCard from "@/src/components/DiaryCard";
import GreetingHeader from "@/src/components/GreetingHeader";
import useTheme from "@/src/hooks/useTheme";
import type { Diary } from "@/src/types/diary";
import { FlatList, View } from "react-native";

const mockDiaries: Diary[] = [
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
];

export default function Home() {
  const { spacing } = useTheme();
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
          data={mockDiaries}
          renderItem={({ item, index }) => (
            <DiaryCard key={index} diary={item} />
          )}
        />
      </View>
    </>
  );
}
