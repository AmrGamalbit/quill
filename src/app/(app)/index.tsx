import DatePill from "@/src/components/DatePill";
import GreetingHeader from "@/src/components/GreetingHeader";
import useTheme from "@/src/hooks/useTheme";
import { View } from "react-native";

export default function Home() {
  const { spacing } = useTheme();
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          justifyContent: "space-between",
          padding: spacing.lg,
        }}
      >
        <GreetingHeader name="Alex" />
        <DatePill />
      </View>
    </>
  );
}
