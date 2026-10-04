import { radius } from "@/src/constants/radius";
import useTheme from "@/src/hooks/useTheme";
import { isSameDay } from "@/src/utils/dates";
import { Pressable, StyleSheet, Text, View } from "react-native";

type DayCellProps = {
  day: Date;
  isSelected: boolean;
  onSelect: (day: Date) => void;
};
export default function DayCell({ day, isSelected, onSelect }: DayCellProps) {
  const { colors } = useTheme();
  const isToday = isSameDay(day, new Date());
  return (
    <Pressable style={styles.cellContainer} onPress={() => onSelect(day)}>
      <View
        style={[
          styles.textWrapper,
          isSelected && { backgroundColor: colors.accent },
        ]}
      >
        <Text
          style={[
            styles.dayText,
            { color: colors.text },
            isToday &&
              !isSelected && {
                color: colors.accent,
              },
            isSelected && {
              color: colors.textOnAccent,
            },
          ]}
        >
          {day.getDate()}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cellContainer: {
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1,
  },
  dayText: {
    fontSize: 14,
  },
  textWrapper: {
    justifyContent: "center",
    alignItems: "center",
    width: 32,
    height: 32,
    borderRadius: radius.md,
  },
});
