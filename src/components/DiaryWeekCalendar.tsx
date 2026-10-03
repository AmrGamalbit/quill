import { View } from "react-native";
import { CalendarProvider, WeekCalendar } from "react-native-calendars";

export default function DiaryWeekCalendar() {
  return (
    <View>
      <CalendarProvider date={"2026-10-03"}>
        <WeekCalendar firstDay={1} />
      </CalendarProvider>
    </View>
  );
}
