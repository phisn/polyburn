-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Replay" (
    "id" SERIAL NOT NULL,
    "world" TEXT NOT NULL,
    "gamemode" TEXT NOT NULL,
    "deaths" INTEGER NOT NULL,
    "ticks" INTEGER NOT NULL,
    "model" BYTEA NOT NULL,

    CONSTRAINT "Replay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_token_key" ON "Player"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Replay_world_gamemode_key" ON "Replay"("world", "gamemode");
