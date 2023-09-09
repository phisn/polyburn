CREATE TABLE `replays` (
	`id` integer PRIMARY KEY NOT NULL,
	`world` text,
	`gamemode` text,
	`deaths` integer,
	`ticks` integer,
	`model` blob
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gamemodeWorld` ON `replays` (`gamemode`,`world`);