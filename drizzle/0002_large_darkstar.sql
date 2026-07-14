CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`companion_id` int NOT NULL,
	`intimacy_level` enum('friendly','flirty','romantic') NOT NULL DEFAULT 'friendly',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversation_id` int NOT NULL,
	`role` enum('user','companion') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`age_verified` int NOT NULL DEFAULT 0,
	`max_intimacy_level` enum('friendly','flirty','romantic') NOT NULL DEFAULT 'friendly',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_preferences_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `companions` ADD `personality_type` enum('friendly','flirty','romantic','intellectual','adventurous') DEFAULT 'friendly' NOT NULL;--> statement-breakpoint
ALTER TABLE `companions` ADD `conversation_style` varchar(256);--> statement-breakpoint
ALTER TABLE `companions` ADD `intimacy_level` enum('friendly','flirty','romantic') DEFAULT 'friendly' NOT NULL;