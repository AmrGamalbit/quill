import { getMonthDays, isSameDay } from "@/src/utils/dates";
import { View } from "react-native";
import DayCell from "./DayCell";

type MonthGridProps = {
  month: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};
export default function MonthGrid({
  month,
  selectedDate,
  onSelectDate,
}: MonthGridProps) {
  const monthDays = getMonthDays(month, 0);
  return (
    <View style={{ margin: 10 }}>
      {monthDays.map((week) => {
        const weekKey = week[0].toISOString();
        return (
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              justifyContent: "space-around",
              margin: 5,
            }}
            key={weekKey}
          >
            {week.map((day: Date) => (
              <DayCell
                key={day.toISOString()}
                day={day}
                isSelected={isSameDay(day, selectedDate)}
                onSelect={onSelectDate}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
}
