CREATE TABLE `worries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`worry` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `worries_worry_unique` ON `worries` (`worry`);