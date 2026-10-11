import dayjs from "dayjs";

export const getWeekHeaders = (weekStartOn: number): string[] => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const start = ((weekStartOn % 7) + 7) % 7;
  return [...days.slice(start), ...days.slice(0, start)];
};

export const isSameDay = (date1: Date, date2: Date) => {
  return dayjs(date1).isSame(dayjs(date2), "day");
};

export const getMonthWeeks = (
  monthStart: Date,
  weekStartOn: number,
): Date[][] => {
  const first = dayjs(monthStart);
  const offset = (first.day() - weekStartOn + 7) % 7;
  const girdStart = first.subtract(offset, "day");
  const grid = Array.from({ length: 6 }, (_, row) =>
    Array.from({ length: 7 }, (_, col) =>
      girdStart.add(7 * row + col, "day").toDate(),
    ),
  );
  return grid;
};

export const startOfMonth = (date: Date): Date => {
  return dayjs(date).startOf("M").toDate();
};

export const addMonths = (date: Date, months: number): Date => {
  return dayjs(date).add(months, "M").toDate();
};

export const toDateKey = (date: Date): string => {
  return dayjs(date).format("YYYY-MM-DD");
};

export const fromDateKey = (key: string): Date => {
  const parsed = dayjs(key, "YYYY-MM-DD", true);
  if (!parsed) throw new Error(`Invalid date key: ${key}`);
  return parsed.toDate();
};
