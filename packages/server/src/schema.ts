import { integer, sqliteTable } from "drizzle-orm/sqlite-core"

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

sqliteTable("replays", {
    id: integer("id").primaryKey(),
})
