import type { Entry } from "@/src/types/entry";
import { View } from "react-native";
import WeekStrip from "./WeekStrip";

type MonthGridProps = {
  entries: Entry[];
  monthDays: Date[][];
  month: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export default function MonthGrid({
  entries,
  monthDays,
  month,
  selectedDate,
  onSelectDate,
}: MonthGridProps) {
  return (
    <View style={{ margin: 10 }}>
      {monthDays.map((week) => {
        const weekKey = week[0].toISOString();
        return (
          <WeekStrip
            entries={entries}
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
