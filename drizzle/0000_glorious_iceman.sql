CREATE TABLE `debates` (
	`id` text PRIMARY KEY NOT NULL,
	`topic` text NOT NULL,
	`stance` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`debate_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`debate_id`) REFERENCES `debates`(`id`) ON UPDATE no action ON DELETE cascade
);
