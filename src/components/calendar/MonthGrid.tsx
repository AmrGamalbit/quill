import { getMonthDays } from "@/src/utils/dates";
import { View } from "react-native";
import WeekStrip from "./WeekStrip";

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
          <WeekStrip
            key={weekKey}
            week={week}
            month={month}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        );
      })}
    </View>
  );
}
