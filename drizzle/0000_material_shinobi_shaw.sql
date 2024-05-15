CREATE TABLE `email_verification_codes` (
	`code` text PRIMARY KEY NOT NULL,
	`verified_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `external_identities` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`provider` text NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`job` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_profile_jobs` (
	`user_id` integer NOT NULL,
	`job_id` integer NOT NULL,
	PRIMARY KEY(`job_id`, `user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` integer PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`date_of_birth_year` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`last_signed_in_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`verification_code` text,
	FOREIGN KEY (`verification_code`) REFERENCES `email_verification_codes`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jobs_job_unique` ON `jobs` (`job`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_profiles_nickname_unique` ON `user_profiles` (`nickname`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);