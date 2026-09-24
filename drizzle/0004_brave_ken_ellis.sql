CREATE TABLE `attempt_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int NOT NULL,
	`questionId` int NOT NULL,
	`taskType` varchar(64) NOT NULL,
	`section` enum('speaking','writing','reading','listening') NOT NULL,
	`score` int,
	`maxScore` int DEFAULT 90,
	`audioUrl` text,
	`transcription` text,
	`responseText` text,
	`feedback` text,
	`traits` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attempt_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `attempt_history` ADD CONSTRAINT `attempt_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attempt_history` ADD CONSTRAINT `attempt_history_sessionId_practice_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `practice_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attempt_history` ADD CONSTRAINT `attempt_history_questionId_questions_id_fk` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE no action ON UPDATE no action;