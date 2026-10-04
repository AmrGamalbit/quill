import { Entry } from "@/src/types/entry";
import { getMonthDays } from "@/src/utils/dates";
import { useState } from "react";
import { View } from "react-native";
import MonthGrid from "./MonthGrid";
import MonthHeader from "./MonthHeader";
import NavButton from "./NavButton";
import WeekHeader from "./WeekHeader";
import WeekStrip from "./WeekStrip";
type CalendarProps = {
  entries: Entry[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export default function Calendar({
  entries,
  selectedDate,
  onSelectDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(true);
  const monthDays = getMonthDays(currentMonth, 0);
  const currentWeek = monthDays.find((week) => {
    return (
      week.some((day) => day.toDateString() == selectedDate.toDateString()) ??
      monthDays[0]
    );
  });
  console.log(currentWeek);
  const handlePrevMonth = () => {
    setCurrentMonth(
      (prev: Date) =>
        new Date(prev.getFullYear(), prev.getMonth() - 1, prev.getDay()),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      (prev: Date) =>
        new Date(prev.getFullYear(), prev.getMonth() + 1, prev.getDay()),
    );
  };

  return (
    <View>
      {isExpanded && (
        <View>
          <MonthHeader
            month={currentMonth}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
          />
          <WeekHeader weekStartOn={0} />
          <MonthGrid
            entries={entries}
            month={currentMonth}
            monthDays={monthDays}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        </View>
      )}
      {!isExpanded && (
        <View>
          <WeekHeader weekStartOn={0} />
          <WeekStrip
            entries={entries}
            week={currentWeek}
            month={currentMonth}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        </View>
      )}
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <NavButton
          icon={"reorder-three-outline"}
          onPress={() => setIsExpanded((prev) => !prev)}
        />
      </View>
    </View>
  );
}
