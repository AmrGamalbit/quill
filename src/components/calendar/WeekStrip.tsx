import { isSameDay } from "@/src/utils/dates";
import { View } from "react-native";
import DayCell from "./DayCell";

type WeekStripProps = {
  week: Date[];
  month: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export default function WeekStrip({
  week,
  month,
  selectedDate,
  onSelectDate,
}: WeekStripProps) {
  const isCurrentMonth = (day: Date) => {
    return (
      day.getMonth() == month.getMonth() &&
      day.getFullYear() == month.getFullYear()
    );
  };
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
        justifyContent: "space-around",
        margin: 5,
      }}
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
}
