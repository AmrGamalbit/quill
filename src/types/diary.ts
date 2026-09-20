import type { Entry } from "./entry";

export type Diary = {
  id: string;
  name: string;
  description: string;
  entries: Entry[];
  members: string[];
  createdAt: string;
  lastOpenedAt: string;
};

export type DiaryFormData = { name: string; description: string };
