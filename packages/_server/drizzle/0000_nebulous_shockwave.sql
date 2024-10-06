CREATE TABLE `leaderboard` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`world` text NOT NULL,
	`gamemode` text NOT NULL,
	`userId` text NOT NULL,
	`ticks` integer NOT NULL,
	`deaths` integer NOT NULL,
	`model` blob NOT NULL
);
--> statement-breakpoint
CREATE INDEX `gamemodeWorld` ON `leaderboard` (`gamemode`,`world`);--> statement-breakpoint
CREATE INDEX `userId` ON `leaderboard` (`userId`);