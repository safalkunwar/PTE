ALTER TABLE `userResponses` ADD `scoreConfidence` float;--> statement-breakpoint
ALTER TABLE `userResponses` ADD `needsReview` boolean DEFAULT false NOT NULL;