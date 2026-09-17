import DatePill from "@/src/components/DatePill";
import DiaryCard from "@/src/components/DiaryCard";
import GreetingHeader from "@/src/components/GreetingHeader";
import useTheme from "@/src/hooks/useTheme";
import { View } from "react-native";

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
        {/* <FlatList renderItem={() => <DiaryCard />} /> */}
        <DiaryCard />
      </View>
    </>
  );
}
