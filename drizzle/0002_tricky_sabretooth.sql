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
ALTER TABLE user_profiles ADD `date_of_birth_year` integer NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `jobs_job_unique` ON `jobs` (`job`);