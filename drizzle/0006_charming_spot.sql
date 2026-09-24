CREATE TABLE `scheduled_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`taskUid` varchar(65) NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`lastRunAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduled_jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `scheduled_jobs_name_unique` UNIQUE(`name`),
	CONSTRAINT `scheduled_jobs_taskUid_unique` UNIQUE(`taskUid`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `isBanned` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `banReason` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bannedAt` timestamp;