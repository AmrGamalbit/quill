import dayjs from "dayjs";

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
