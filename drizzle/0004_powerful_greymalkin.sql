CREATE TABLE `attachments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entryId` integer NOT NULL,
	`kind` text NOT NULL,
	`rel_path` text NOT NULL,
	`mimeType` text NOT NULL,
	`width` integer,
	`height` integer,
	`duration_ms` integer,
	`size_bytes` integer,
	`name` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`entryId`) REFERENCES `entries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_attachments_entry` ON `attachments` (`entryId`);