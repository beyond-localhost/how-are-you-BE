CREATE TABLE `external_identities` (
	`id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`email` text NOT NULL,
	`provider` text NOT NULL,
	CONSTRAINT `external_identities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`revoked` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL DEFAULT (CURRENT_DATE),
	`updated_at` datetime NOT NULL DEFAULT (CURRENT_DATE),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int NOT NULL,
	`nickname` text NOT NULL,
	`birthday` datetime NOT NULL,
	`gender` text,
	`job_id` int NOT NULL,
	`created_at` datetime NOT NULL DEFAULT (CURRENT_DATE),
	`updated_at` datetime NOT NULL DEFAULT (CURRENT_DATE),
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles_worries` (
	`user_profile_id` int NOT NULL,
	`worry_id` int NOT NULL,
	CONSTRAINT `user_profiles_worries_user_profile_id_worry_id_pk` PRIMARY KEY(`user_profile_id`,`worry_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` text NOT NULL,
	`created_at` datetime NOT NULL DEFAULT (CURRENT_DATE),
	`last_signed_in_at` datetime NOT NULL DEFAULT (CURRENT_DATE),
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `question_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`answer` text NOT NULL,
	`question_distribution_id` int NOT NULL,
	`user_id` int NOT NULL,
	`is_public` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL DEFAULT (CURRENT_DATE),
	`updated_at` datetime NOT NULL DEFAULT (CURRENT_DATE),
	CONSTRAINT `question_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `question_distributions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question_id` int NOT NULL,
	`distribution_date` datetime NOT NULL DEFAULT (CURRENT_DATE),
	CONSTRAINT `question_distributions_id` PRIMARY KEY(`id`),
	CONSTRAINT `question_distributions_distribution_date_unique` UNIQUE(`distribution_date`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question` text NOT NULL,
	`created_at` datetime NOT NULL DEFAULT (CURRENT_DATE),
	`updated_at` datetime NOT NULL DEFAULT (CURRENT_DATE),
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`job` varchar(20) NOT NULL,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `jobs_job_unique` UNIQUE(`job`)
);
--> statement-breakpoint
CREATE TABLE `worries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`worry` varchar(20) NOT NULL,
	CONSTRAINT `worries_id` PRIMARY KEY(`id`),
	CONSTRAINT `worries_worry_unique` UNIQUE(`worry`)
);
--> statement-breakpoint
ALTER TABLE `external_identities` ADD CONSTRAINT `external_identities_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_id_users_id_fk` FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_job_id_jobs_id_fk` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_profiles_worries` ADD CONSTRAINT `user_profiles_worries_user_profile_id_user_profiles_id_fk` FOREIGN KEY (`user_profile_id`) REFERENCES `user_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_profiles_worries` ADD CONSTRAINT `user_profiles_worries_worry_id_worries_id_fk` FOREIGN KEY (`worry_id`) REFERENCES `worries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question_answers` ADD CONSTRAINT `question_answers_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `question_answers` ADD CONSTRAINT `answer_distribution_id_fk` FOREIGN KEY (`question_distribution_id`) REFERENCES `question_distributions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `question_distributions` ADD CONSTRAINT `question_distributions_question_id_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `question_answers` (`created_at`);