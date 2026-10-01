PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_diaries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_diaries`("id", "name", "description", "createdAt") SELECT "id", "name", "description", "createdAt" FROM `diaries`;--> statement-breakpoint
DROP TABLE `diaries`;--> statement-breakpoint
ALTER TABLE `__new_diaries` RENAME TO `diaries`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`diaryId` integer,
	`title` text NOT NULL,
	`body` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`diaryId`) REFERENCES `diaries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_entries`("id", "diaryId", "title", "body", "createdAt", "updatedAt") SELECT "id", "diaryId", "title", "body", "createdAt", "updatedAt" FROM `entries`;--> statement-breakpoint
DROP TABLE `entries`;--> statement-breakpoint
ALTER TABLE `__new_entries` RENAME TO `entries`;