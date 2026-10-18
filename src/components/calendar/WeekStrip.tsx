import type { Entry } from "@/src/types/entry";
import { isSameDay, toDateKey } from "@/src/utils/dates";
import { useWindowDimensions, View } from "react-native";
import DayCell from "./DayCell";

type WeekStripProps = {
  week: Date[];
  month: Date;
  entries: Entry[];
  selectedDate: Date | null;
  onDayPress: (date: Date) => void;
  onDayLongPress: (date: Date) => void;
};

export default function WeekStrip({
  week,
  month,
  entries,
  selectedDate,
  onDayPress,
  onDayLongPress,
}: WeekStripProps) {
  const isCurrentMonth = (day: Date) => {
    return (
      day.getMonth() == month.getMonth() &&
      day.getFullYear() == month.getFullYear()
    );
  };
  const hasEntries = (day: Date): boolean => {
    return entries.some((e) => e.entryDate === toDateKey(day));
  };
  const { width } = useWindowDimensions();
  const height = width / 7;
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        height: height,
      }}
    >
      {week.map((day: Date) => (
        <DayCell
          key={day.toISOString()}
          day={day}
          hasEntries={hasEntries(day)}
          isCurrentMonth={isCurrentMonth(day)}
          isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
          onPress={onDayPress}
          onLongPress={onDayLongPress}
        />
      ))}
    </View>
  );
}
