import {
    Attachment,
    deleteAttachmentRow,
    deleteDiary,
    deleteEntry,
    getAttachmentsByEntryId,
    getEntriesByDiaryId,
    insertAttachment,
    saveEntry,
    updateEntry,
} from "@/src/utils/db";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT = () => `${FileSystem.documentDirectory}attachments/`;

/** DB stores paths relative to documentDirectory (the iOS container path changes across updates). */
export const resolveAttachmentUri = (relPath: string) =>
  `${FileSystem.documentDirectory}${relPath}`;

// ---------------------------------------------------------------------------
// Picking
// ---------------------------------------------------------------------------

export interface PendingAttachment {
  kind: "image" | "video";
  uri: string; // picker cache URI, not yet persisted
  mimeType: string;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  sizeBytes: number | null;
}

export async function pickMedia(): Promise<PendingAttachment[]> {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images", "videos"],
    allowsMultipleSelection: true,
    selectionLimit: 10,
    quality: 0.8,
    videoExportPreset: ImagePicker.VideoExportPreset.H264_1280x720, // iOS only
  });
  if (res.canceled) return [];

  return res.assets
    .filter((a) => a.type === "image" || a.type === "video")
    .map((a) => ({
      kind: a.type as "image" | "video",
      uri: a.uri,
      mimeType: a.mimeType ?? (a.type === "video" ? "video/mp4" : "image/jpeg"),
      width: a.width ?? null,
      height: a.height ?? null,
      durationMs: a.duration ?? null,
      sizeBytes: a.fileSize ?? null,
    }));
}

// ---------------------------------------------------------------------------
// Persisting / removing files
// ---------------------------------------------------------------------------

export async function persistAttachments(
  entryId: number,
  pending: PendingAttachment[],
): Promise<Attachment[]> {
  await FileSystem.makeDirectoryAsync(`${ROOT()}${entryId}/`, {
    intermediates: true,
  });

  const saved: Attachment[] = [];
  let current: string | null = null;

  try {
    for (const p of pending) {
      const ext =
        p.uri.split("?")[0].split(".").pop() ??
        (p.kind === "video" ? "mp4" : "jpg");
      const relPath =
        (current = `attachments/${entryId}/${Crypto.randomUUID()}.${ext}`);

      await FileSystem.copyAsync({
        from: p.uri,
        to: resolveAttachmentUri(relPath),
      });

      const row = {
        entry_id: entryId,
        kind: p.kind,
        rel_path: relPath,
        mime_type: p.mimeType,
        width: p.width,
        height: p.height,
        duration_ms: p.durationMs,
        size_bytes: p.sizeBytes,
      };
      saved.push({ id: insertAttachment(row), ...row });
      current = null;
    }
  } catch (e) {
    // Roll back only what this call created; never touch pre-existing attachments.
    if (current) await removeAttachmentFile(current).catch(() => {});
    for (const s of saved) {
      deleteAttachmentRow(s.id);
      await removeAttachmentFile(s.rel_path).catch(() => {});
    }
    throw e;
  }

  return saved;
}

export async function removeAttachmentFile(relPath: string): Promise<void> {
  await FileSystem.deleteAsync(resolveAttachmentUri(relPath), {
    idempotent: true,
  });
}

export async function removeEntryMedia(entryId: number): Promise<void> {
  await FileSystem.deleteAsync(`${ROOT()}${entryId}/`, { idempotent: true });
}

/** Call wherever resetLocalDatabase() is called (logout / account deletion). */
export async function removeAllMedia(): Promise<void> {
  await FileSystem.deleteAsync(ROOT(), { idempotent: true });
}

// ---------------------------------------------------------------------------
// Entry-level operations (use these instead of calling db.ts directly)
// ---------------------------------------------------------------------------

export async function createEntryWithMedia(
  diaryId: number,
  title: string,
  body: string,
  added: PendingAttachment[],
): Promise<number> {
  const entryId = saveEntry(diaryId, title, body);
  try {
    if (added.length) await persistAttachments(entryId, added);
  } catch (e) {
    deleteEntry(entryId); // don't leave an entry the user believes has media
    await removeEntryMedia(entryId).catch(() => {});
    throw e;
  }
  return entryId;
}

export async function updateEntryWithMedia(
  entryId: number,
  title: string,
  body: string,
  media: { added: PendingAttachment[]; removedIds: number[] },
): Promise<void> {
  updateEntry(entryId, title, body);

  // Add first: it can throw and rolls itself back, so removals never run on failure.
  if (media.added.length) await persistAttachments(entryId, media.added);

  if (media.removedIds.length) {
    const doomed = getAttachmentsByEntryId(entryId).filter((a) =>
      media.removedIds.includes(a.id),
    );
    for (const a of doomed) {
      await removeAttachmentFile(a.rel_path);
      deleteAttachmentRow(a.id);
    }
  }
}

export async function deleteEntryWithMedia(entryId: number): Promise<void> {
  await removeEntryMedia(entryId);
  deleteEntry(entryId);
}

export async function deleteDiaryWithMedia(diaryId: number): Promise<void> {
  for (const e of getEntriesByDiaryId(diaryId)) {
    await removeEntryMedia(e.id);
  }
  deleteDiary(diaryId);
}
