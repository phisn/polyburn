CREATE TABLE `logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userid` integer NOT NULL,
	`time` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `replays` (
	`id` text PRIMARY KEY NOT NULL,
	`replay-key` text NOT NULL,
	`input-key` text,
	`input-model-key` text,
	`deaths` integer NOT NULL,
	`gamemode` text NOT NULL,
	`ticks` integer NOT NULL,
	`worldname` text NOT NULL,
	`userId` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `gamemodeWorld` ON `replays` (`gamemode`,`worldname`);--> statement-breakpoint
CREATE INDEX `userId` ON `replays` (`userId`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`username` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);