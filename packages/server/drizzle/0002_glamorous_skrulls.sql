PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_replays` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` integer,
	`replayKey` text NOT NULL,
	`inputKey` text NOT NULL,
	`deaths` integer NOT NULL,
	`gamemode` text NOT NULL,
	`ticks` integer NOT NULL,
	`worldname` text NOT NULL,
	`userId` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_replays`("id", "timestamp", "replayKey", "inputKey", "deaths", "gamemode", "ticks", "worldname", "userId") SELECT "id", "timestamp", "replayKey", COALESCE("inputModelKey", "inputKey") as "inputKey", "deaths", "gamemode", "ticks", "worldname", "userId" FROM `replays`;--> statement-breakpoint
DROP TABLE `replays`;--> statement-breakpoint
ALTER TABLE `__new_replays` RENAME TO `replays`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `gamemodeWorld` ON `replays` (`gamemode`,`worldname`);--> statement-breakpoint
CREATE INDEX `userId` ON `replays` (`userId`);