import { getMonthDays } from "@/src/utils/dates";
import { Text, View } from "react-native";

type props = { month: Date };
export default function MonthGrid({ month }: props) {
  const monthDays = getMonthDays(month, 0);
  return (
    <View>
      {monthDays.map((w) => {
        return (
          <View style={{ flexDirection: "row", gap: 10 }}>
            {w.map((d) => (
              <Text>{d.toLocaleDateString()}</Text>
            ))}
          </View>
        );
      })}
    </View>
  );
}
