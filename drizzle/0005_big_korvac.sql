ALTER TABLE `local_profile` RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_attachments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entry_id` integer NOT NULL,
	`kind` text NOT NULL,
	`rel_path` text NOT NULL,
	`mimeType` text NOT NULL,
	`width` integer,
	`height` integer,
	`duration_ms` integer,
	`size_bytes` integer,
	`name` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `entries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_attachments`("id", "entry_id", "kind", "rel_path", "mimeType", "width", "height", "duration_ms", "size_bytes", "name", "created_at") SELECT "id", "entry_id", "kind", "rel_path", "mimeType", "width", "height", "duration_ms", "size_bytes", "name", "created_at" FROM `attachments`;--> statement-breakpoint
DROP TABLE `attachments`;--> statement-breakpoint
ALTER TABLE `__new_attachments` RENAME TO `attachments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_attachments_entry` ON `attachments` (`entry_id`);--> statement-breakpoint
CREATE TABLE `__new_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`diary_id` integer NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`entry_date` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`diary_id`) REFERENCES `diaries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_entries`("id", "diary_id", "title", "body", "entry_date", "created_at", "updated_at") SELECT "id", "diary_id", "title", "body", "entry_date", "created_at", "updated_at" FROM `entries`;--> statement-breakpoint
DROP TABLE `entries`;--> statement-breakpoint
ALTER TABLE `__new_entries` RENAME TO `entries`;--> statement-breakpoint
CREATE INDEX `idx_entries_diary_date` ON `entries` (`diary_id`,`entry_date`);