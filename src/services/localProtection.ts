import { secure } from "@/modules/file-guard";
import * as FileSystem from "expo-file-system/legacy";
import { defaultDatabaseDirectory } from "expo-sqlite";
import { ROOT } from "./attachments";

const AVATAR_PREFIX = "avatar_";

export async function protectLocalStorage(): Promise<void> {
  const docs = FileSystem.documentDirectory;
  if (!docs) return;

  await FileSystem.makeDirectoryAsync(ROOT(), { intermediates: true }).catch(
    () => {},
  );
  const avatars = (await FileSystem.readDirectoryAsync(docs))
    .filter((name) => name.startsWith(AVATAR_PREFIX))
    .map((name) => `${docs}${name}`);

  const jobs: [label: string, run: Promise<number>][] = [
    ["attachments", secure(ROOT(), { protect: true, recursive: true })],
    ["database", secure(defaultDatabaseDirectory, { protect: false })],
    ...avatars.map((p): [string, Promise<number>] => [
      "avatar",
      secure(p, { protect: true }),
    ]),
  ];

  const results = await Promise.allSettled(jobs.map(([, run]) => run));
  results.forEach((r, i) => {
    if (r.status === "rejected")
      console.error(`File protection failed (${jobs[i][0]}):`, r.reason);
    else if (r.value > 0)
      console.warn(
        `File Protection: ${r.value} item(s) failed (${jobs[i][0]})`,
      );
  });
}
