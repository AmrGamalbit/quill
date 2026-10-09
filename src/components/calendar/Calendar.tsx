import useCalendarCollapse from "@/src/hooks/useCalendarCollapse";
import { Entry } from "@/src/types/entry";
import { getMonthWeeks } from "@/src/utils/dates";
import { useState } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import MonthGrid from "./MonthGrid";
import MonthHeader from "./MonthHeader";
import NavButton from "./NavButton";
import WeekHeader from "./WeekHeader";

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
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth(),
  );
  const weeks = getMonthWeeks(currentMonth, 0);
  const currentWeek =
    weeks.find((week) => {
      return week.some(
        (day) => day.toDateString() == selectedDate.toDateString(),
      );
    }) ?? weeks[0];
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => prev--);
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => prev++);
  };

  const { toggle, headerStyle, gridContainerStyle, gridStyle } =
    useCalendarCollapse(2);

  return (
    <View>
      <Animated.View style={headerStyle}>
        <MonthHeader
          month={currentMonth}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
        />
      </Animated.View>
      <WeekHeader weekStartOn={0} />
      <Animated.View style={[gridContainerStyle, { overflow: "hidden" }]}>
        <Animated.View style={gridStyle}>
          <MonthGrid
            entries={entries}
            month={currentMonth}
            weeks={weeks}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        </Animated.View>
      </Animated.View>

      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <NavButton icon={"reorder-three-outline"} onPress={toggle} />
      </View>
    </View>
  );
}
