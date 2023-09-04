import RAPIER from "@dimforge/rapier2d-compat"
import { ReplayModel } from "runtime/proto/replay"
import { WorldModel } from "runtime/proto/world"
import { validateReplay } from "runtime/src/model/replay/validateReplay"
import { z } from "zod"
import { replayKeyFrom, replays } from "../domain/replays"
import { worlds } from "../domain/worlds"
import { publicProcedure } from "../trpc"

export const validateReplayProcedure = publicProcedure
    .input(
        z
            .object({
                world: z.string(),
                gamemode: z.string(),
                replay: z.string(),
            })
            .required(),
    )
    .mutation(async opts => {
        const world = worlds.find(world => world.id.name === opts.input.world)

        if (!world) {
            throw new Error(`World not found: ${opts.input.world}`)
        }

        await RAPIER.init()

        const replayModel = ReplayModel.decode(Buffer.from(opts.input.replay, "base64"))
        const worldModel = WorldModel.decode(Buffer.from(world.model, "base64"))

        const stats = validateReplay(replayModel, worldModel, opts.input.gamemode)

        if (!stats) {
            throw new Error("Replay is invalid")
        }

        const replayKey = replayKeyFrom(opts.input.world, opts.input.gamemode)
        const currentReplay = replays[replayKey]

        console.log("ticks in" + stats.ticks + " < " + currentReplay?.stats.ticks)

        if (currentReplay === undefined || stats.ticks < currentReplay.stats.ticks) {
            replays[replayKey] = {
                world: opts.input.world,
                gamemode: opts.input.gamemode,
                stats,
                model: opts.input.replay,
            }

            console.log("result: " + JSON.stringify(replays[replayKey]))
        }

        return stats
    })
