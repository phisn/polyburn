CREATE TABLE `replays` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`world` text NOT NULL,
	`gamemode` text NOT NULL,
	`deaths` integer NOT NULL,
	`ticks` integer NOT NULL,
	`model` blob NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gamemodeWorld` ON `replays` (`gamemode`,`world`);