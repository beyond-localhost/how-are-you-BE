CREATE TABLE `external_identities` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`email` text NOT NULL,
	`provider` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`revoked` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` integer PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`birthday` text NOT NULL,
	`job_id` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_profiles_worries` (
	`user_profile_id` integer NOT NULL,
	`worry_id` integer NOT NULL,
	PRIMARY KEY(`user_profile_id`, `worry_id`),
	FOREIGN KEY (`user_profile_id`) REFERENCES `user_profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`worry_id`) REFERENCES `worries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`last_signed_in_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `question_answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`answer` text NOT NULL,
	`question_distribution_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`question_distribution_id`) REFERENCES `question_distributions`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `question_distributions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question_id` integer NOT NULL,
	`distribution_date` text DEFAULT (CURRENT_DATE) NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`job` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `worries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`worry` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `question_answers` (`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `question_distributions_distribution_date_unique` ON `question_distributions` (`distribution_date`);--> statement-breakpoint
CREATE UNIQUE INDEX `jobs_job_unique` ON `jobs` (`job`);--> statement-breakpoint
CREATE UNIQUE INDEX `worries_worry_unique` ON `worries` (`worry`);