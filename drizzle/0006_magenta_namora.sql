CREATE TABLE `app_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`resume_diary_id` integer,
	FOREIGN KEY (`resume_diary_id`) REFERENCES `diaries`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "app_state_singleton" CHECK("app_state"."id" = 1)
);
--> statement-breakpoint
ALTER TABLE `diaries` ADD `color` text DEFAULT 'cobalt' NOT NULL;--> statement-breakpoint
ALTER TABLE `diaries` ADD `last_opened_at` integer;