import { useState } from "react";
import { View } from "react-native";
import MonthGrid from "./MonthGrid";
import MonthHeader from "./MonthHeader";
import WeekHeader from "./WeekHeader";

type CalendarProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export default function Calendar({
  selectedDate,
  onSelectDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
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
      <MonthHeader
        month={currentMonth}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
      />
      <WeekHeader weekStartOn={0} />
      <MonthGrid
        month={currentMonth}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
      />
    </View>
  );
}
