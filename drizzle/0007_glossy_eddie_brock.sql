CREATE TABLE `diary_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`diary_remote_id` text NOT NULL,
	`inviter_id` text NOT NULL,
	`inviter_name` text,
	`diary_name` text,
	`diary_color` text,
	`wrapped_key` text NOT NULL,
	`wrapped_sig` text NOT NULL,
	`preview_blob` text NOT NULL,
	`key_epoch` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `diary_keys` (
	`diary_remote_id` text NOT NULL,
	`key_epoch` integer DEFAULT 1 NOT NULL,
	`diary_key_hex` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_diary_keys_remote` ON `diary_keys` (`diary_remote_id`,`key_epoch`);--> statement-breakpoint
CREATE TABLE `diary_members` (
	`diary_remote_id` text NOT NULL,
	`user_id` text NOT NULL,
	`username` text,
	`role` text NOT NULL,
	`name` text,
	`photo_uri` text,
	`joined_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_diary_members_remote` ON `diary_members` (`diary_remote_id`,`user_id`);--> statement-breakpoint
ALTER TABLE `diaries` ADD `remote_id` text;--> statement-breakpoint
ALTER TABLE `diaries` ADD `owner_id` text;--> statement-breakpoint
ALTER TABLE `diaries` ADD `key_epoch` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `diaries` ADD `last_synced_seq` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `diaries` ADD `sync_state` text DEFAULT 'synced' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `diaries_remote_id_unique` ON `diaries` (`remote_id`);--> statement-breakpoint
ALTER TABLE `entries` ADD `remote_id` text;--> statement-breakpoint
ALTER TABLE `entries` ADD `author_id` text;--> statement-breakpoint
ALTER TABLE `entries` ADD `version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `entries` ADD `key_epoch` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `entries` ADD `change_seq` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `entries` ADD `deleted` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `entries` ADD `sync_state` text DEFAULT 'synced' NOT NULL;--> statement-breakpoint
ALTER TABLE `entries` ADD `conflict_server_data` text;--> statement-breakpoint
CREATE UNIQUE INDEX `entries_remote_id_unique` ON `entries` (`remote_id`);--> statement-breakpoint
CREATE INDEX `idx_entries_sync_state` ON `entries` (`sync_state`);--> statement-breakpoint
CREATE INDEX `idx_entries_remote_id` ON `entries` (`remote_id`);