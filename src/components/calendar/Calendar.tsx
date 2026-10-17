import { spacing } from "@/src/constants/spacings";
import useCalendarCollapse from "@/src/hooks/useCalendarCollapse";
import useTheme from "@/src/hooks/useTheme";
import { Entry } from "@/src/types/entry";
import {
  addMonths,
  getMonthWeeks,
  isSameDay,
  startOfMonth,
  toDateKey,
} from "@/src/utils/dates";
import { DatePicker } from "@quidone/react-native-wheel-picker";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import AppModal from "../ui/AppModal";
import CalendarHeader from "./CalendarHeader";
import MonthGrid from "./MonthGrid";
import NavButton from "./NavButton";
import WeekHeader from "./WeekHeader";
type CalendarProps = {
  entries: Entry[];
  selectedDate: Date;
  onDayPress: (date: Date) => void;
  onDayLongPress: (date: Date) => void;
};

export default function Calendar({
  entries,
  selectedDate,
  onDayPress,
  onDayLongPress,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(selectedDate),
  );
  const { colors } = useTheme();
  const weeks = getMonthWeeks(currentMonth, 0);
  const [showPicker, setShowPicker] = useState(false);
  const selectedRow = weeks.findIndex((w) =>
    w.some((d) => isSameDay(d, selectedDate)),
  );

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const {
    toggle,
    headerStyle,
    gridContainerStyle,
    gridStyle,
    panGesture,
    isExapnded,
  } = useCalendarCollapse(selectedRow);

  useEffect(() => {
    setCurrentMonth(startOfMonth(selectedDate));
  }, [selectedDate, isExapnded]);
  console.log(toDateKey(selectedDate));
  return (
    <View style={{ marginHorizontal: spacing.md }}>
      <Animated.View style={headerStyle}>
        <CalendarHeader
          month={currentMonth}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
          onTitlePress={() => setShowPicker((prev) => !prev)}
        />
      </Animated.View>
      <WeekHeader weekStartOn={0} />
      <GestureDetector gesture={panGesture}>
        <View>
          <Animated.View style={[gridContainerStyle, { overflow: "hidden" }]}>
            <Animated.View style={gridStyle}>
              <MonthGrid
                entries={entries}
                month={currentMonth}
                weeks={weeks}
                selectedDate={selectedDate}
                onDayPress={onDayPress}
                onDayLongPress={onDayLongPress}
              />
            </Animated.View>
          </Animated.View>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <NavButton
              icon={isExapnded ? "chevron-up-outline" : "chevron-down-outline"}
              onPress={toggle}
            />
          </View>
        </View>
      </GestureDetector>
      <AppModal
        title="Jump To"
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
      >
        <View style={{ alignItems: "center" }}>
          <DatePicker
            itemTextStyle={{ color: colors.text }}
            date={toDateKey(selectedDate)}
            onDateChanged={({ date }: { date: string }) =>
              onDayPress(new Date(date))
            }
          />
        </View>
      </AppModal>
    </View>
  );
}
