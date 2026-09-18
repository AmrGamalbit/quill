import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { StyleSheet, Text, View } from "react-native";
import { spacing } from "../constants/spacings";
import { fontSizes } from "../constants/typography";
import useTheme from "../hooks/useTheme";
import type { Diary } from "../types/diary";
import type { Entry } from "../types/entry";
import Pill from "./Pill";

dayjs.extend(relativeTime);

export default function DiaryCard({ diary }: { diary: Diary }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        style.cardContainer,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <CardHeader diary={diary} />
      <SnippetBox diary={diary} />
      <CardFooter diary={diary} />
    </View>
  );
}

function CardHeader({ diary }: { diary: Diary }) {
  return (
    <View style={style.headerContainer}>
      <CardHeaderInfo diary={diary} />
      <CardCover />
    </View>
  );
}

function CardHeaderInfo({ diary }: { diary: Diary }) {
  const { colors } = useTheme();
  return (
    <View style={style.headerInfoContainer}>
      <Text style={[style.headerTitle, { color: colors.text }]}>
        {diary.name}
      </Text>
      <View style={style.headerMeta}>
        <Text style={[style.headerMetaText, { color: colors.text }]}>
          {diary.members.length} members
        </Text>
        <Text style={[style.headerMetaText, { color: colors.text }]}>•</Text>
        <Text style={[style.headerMetaText, { color: colors.text }]}>
          {diary.entries.length} entries
        </Text>
      </View>
    </View>
  );
}

function CardCover() {
  return <View style={style.coverContainer}></View>;
}

function SnippetBox({ diary }: { diary: Diary }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        style.snippetContainer,
        {
          backgroundColor: colors.surface,
        },
      ]}
    >
      <Text>{diary.entries[0].body}</Text>
    </View>
  );
}

function CardFooter({ diary }: { diary: Diary }) {
  const newEntries = diary.entries.filter(
    (e) => diary.lastOpenedAt > e.createdAt,
  );
  const latestEntry = getLatestEntry(diary.entries);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Text>
        Updated by {latestEntry?.author}{" "}
        {dayjs().to(dayjs(latestEntry?.createdAt))}
      </Text>
      <Pill text={`${newEntries.length} new entries`} />
    </View>
  );
}

function getLatestEntry(entries: Entry[]) {
  if (entries.length == 0) return;
  const latestEntry = entries.reduce((latest, entry) =>
    new Date(latest.createdAt) > new Date(entry.createdAt) ? latest : entry,
  );
  return latestEntry;
}

const style = StyleSheet.create({
  cardContainer: {
    marginVertical: spacing.lg,
    borderWidth: 1,
    gap: 10,
    padding: spacing.lg,
    borderRadius: spacing.lg,
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerInfoContainer: { justifyContent: "space-around" },
  headerTitle: { fontSize: fontSizes.lg },
  headerMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5,
  },
  headerMetaText: {
    fontSize: fontSizes.sm,
  },
  coverContainer: {
    backgroundColor: "red",
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  snippetContainer: { padding: 10, borderRadius: 10 },
});
