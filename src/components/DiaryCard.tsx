import { StyleSheet, Text, View } from "react-native";
import { spacing } from "../constants/spacings";
import { fontSizes } from "../constants/typography";
import useTheme from "../hooks/useTheme";
import Pill from "./Pill";

export default function DiaryCard() {
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
      <CardHeader />
      <SnippetBox />
      <CardFooter />
    </View>
  );
}

function CardHeader() {
  return (
    <View style={style.headerContainer}>
      <CardHeaderInfo />
      <CardCover />
    </View>
  );
}

function CardHeaderInfo() {
  const { colors } = useTheme();
  return (
    <View style={style.headerInfoContainer}>
      <Text style={[style.headerTitle, { color: colors.text }]}>
        France Holiday
      </Text>
      <View style={style.headerMeta}>
        <Text style={[style.headerMetaText, { color: colors.text }]}>
          4 members
        </Text>
        <Text style={[style.headerMetaText, { color: colors.text }]}>•</Text>
        <Text style={[style.headerMetaText, { color: colors.text }]}>
          5 entries
        </Text>
      </View>
    </View>
  );
}

function CardCover() {
  return <View style={style.coverContainer}></View>;
}

function SnippetBox() {
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
      <Text>
        “We got up before sunrise because Sam insisted the light over the old
        town would be worth it, and honestly, standing on that hill with...
      </Text>
    </View>
  );
}

function CardFooter() {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Text>Updated by Sam 1 hour ago</Text>
      <Pill text="3 new entries" />
    </View>
  );
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
