import { blob, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

/*
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Player {
  id    Int    @id @default(autoincrement())
  token String @unique
}

model Replay {
  id Int @id @default(autoincrement())

  world    String
  gamemode String

  deaths Int
  ticks  Int
  model  Bytes

  @@unique([world, gamemode])
}
*/

export const replays = sqliteTable(
    "replays",
    {
        id: integer("id").primaryKey(),

        world: text("world"),
        gamemode: text("gamemode"),

        deaths: integer("deaths"),
        ticks: integer("ticks"),

        modell: blob("modell"),
    },
    replays => ({
        gamemodeWorld: uniqueIndex("gamemodeWorld").on(replays.gamemode, replays.world),
    }),
)

export type Replay = typeof replays.$inferSelect
export type InsertReplay = typeof replays.$inferInsert
