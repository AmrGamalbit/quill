import { eq } from "drizzle-orm";
import { db } from ".";
import type { Attachment, NewAttachment } from "../types/attachment";
import { AttachmentsTable as attachments } from "./schema";

export const insertAttachment = async (
  a: NewAttachment,
): Promise<Attachment> => {
  const [row] = await db.insert(attachments).values(a).returning();
  return row;
};

export const getAttachmentsByEntryId = async (
  entryId: number,
): Promise<Attachment[]> => {
  return await db
    .select()
    .from(attachments)
    .where(eq(attachments.entryId, entryId))
    .orderBy(attachments.id);
};

export const deleteAttachmentRow = async (id: number): Promise<void> => {
  await db.delete(attachments).where(eq(attachments.id, id));
};
