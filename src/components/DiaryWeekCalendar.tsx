import { useEffect, useState } from "react";
import { View } from "react-native";
import { CalendarProvider, ExpandableCalendar } from "react-native-calendars";
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
    <View
      style={{
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <CalendarProvider date={selectedDate} onDateChanged={onSelectDate}>
        <ExpandableCalendar
          firstDay={1}
          theme={{
            calendarBackground: colors.background,
            selectedDayBackgroundColor: colors.accent,
            selectedDayTextColor: colors.textOnAccent,
            backgroundColor: colors.card,
            todayBackgroundColor: colors.border,
            todayTextColor: colors.accent,
          }}
          style={{ borderRadius: 10, backgroundColor: colors.background }}
          key={forceRenderKey}
        />
      </CalendarProvider>
    </View>
  );
}
