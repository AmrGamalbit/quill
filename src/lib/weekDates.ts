import dayjs from "dayjs";
import { Entry } from "../types/entry";

export const getWeekDates = (date: Date): Date[] => {
  const startOfWeek = dayjs(date).startOf("week");
  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(startOfWeek.add(i, "day").toDate());
  }
  return dates;
};

export const isToday = (date: Date): boolean => {
  return dayjs(date).isSame(dayjs());
};

export const getEntriesForDate = (entries: Entry[], date: Date): Entry[] => {
  return entries.filter((e) => dayjs(e.createdAt).isSame(date));
};
