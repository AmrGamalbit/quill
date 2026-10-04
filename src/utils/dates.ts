import dayjs from "dayjs";

export const getWeekHeaders = (weekStartOn: number): string[] => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const start = ((weekStartOn % 7) + 7) % 7;
  return [...days.slice(start), ...days.slice(0, start)];
};

export const isSameDay = (date1: Date, date2: Date) => {
  return dayjs(date1).isSame(dayjs(date2), "day");
};

export const getWeekDays = (date: Date)=>{}

export const getMonthDays = (month: Date, weekStartOn: number): Date[][] => {
  const startOfMonth = dayjs(month).startOf("month");
  const offset = (startOfMonth.day() - weekStartOn + 7) % 7;
  const girdStart = startOfMonth.subtract(offset, "day");
  const grid = Array.from({ length: 6 }, (_, row) =>
    Array.from({ length: 7 }, (_, col) =>
      girdStart.add(7 * row + col, "day").toDate(),
    ),
  );
  return grid;
};
