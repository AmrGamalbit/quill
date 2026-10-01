ALTER TABLE `diaries` RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE `entries` RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE `entries` RENAME COLUMN "updatedAt" TO "updated_at";