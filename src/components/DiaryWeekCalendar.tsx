import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
} from "@howljs/calendar-kit";
import { useEffect, useState } from "react";
import useTheme from "../hooks/useTheme";

export default function DiaryWeekCalendar({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const { colors } = useTheme();
  const [forceRenderKey, setForceRenderKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setForceRenderKey(1), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <CalendarContainer>
      <CalendarHeader />
      <CalendarBody />
    </CalendarContainer>
  );
}
