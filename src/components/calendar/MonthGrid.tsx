import type { Entry } from "@/src/types/entry";
import { View } from "react-native";
import WeekStrip from "./WeekStrip";

type MonthGridProps = {
  entries: Entry[];
  weeks: Date[][];
  month: number;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export default function MonthGrid({
  entries,
  weeks,
  month,
  selectedDate,
  onSelectDate,
}: MonthGridProps) {
  return (
    <View style={{ margin: 10 }}>
      {weeks.map((week) => {
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
