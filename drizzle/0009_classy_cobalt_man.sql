ALTER TABLE `practice_sessions` MODIFY COLUMN `status` enum('in_progress','paused','completed','abandoned') NOT NULL DEFAULT 'in_progress';--> statement-breakpoint
ALTER TABLE `practice_sessions` ADD `pausedAt` timestamp;--> statement-breakpoint
ALTER TABLE `practice_sessions` ADD `pausedIndex` int DEFAULT 0;