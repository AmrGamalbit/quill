import { getMonthDays, isSameDay } from "@/src/utils/dates";
import { View } from "react-native";
import DayCell from "./DayCell";
import WeekHeader from "./WeekHeader";

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
  const isCurrentMonth = (day: Date) => {
    return (
      day.getMonth() == month.getMonth() &&
      day.getFullYear() == month.getFullYear()
    );
  };

  return (
    <View style={{ margin: 10 }}>
      <WeekHeader weekStartOn={0} />
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
                isCurrentMonth={isCurrentMonth(day)}
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
