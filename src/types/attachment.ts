import { AttachmentsTable as attachments } from "../db/schema";

export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;
export type AttachmentCounts = { image: number; audio: number; video: number };
