import { sql } from "drizzle-orm"
import { blob, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { Packet, packThrusts, unpackThrusts } from "game/src/model/replay"
import { randomUUID } from "node:crypto"
import { ReplayFrameDTO, ReplaySummaryDTO } from "shared/src/server/replay"
import { users } from "../user/user-model"

export const replays = sqliteTable(
    "replays",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => randomUUID()),

        binaryModel: blob("model", { mode: "buffer" }).notNull(),
        binaryFrames: blob("model", { mode: "buffer" }).notNull(),
        deaths: integer("deaths").notNull(),
        gamemode: text("gamemode").notNull(),
        ticks: integer("ticks").notNull(),
        worldname: text("world").notNull(),

        userId: integer("userId").notNull(),
    },
    leaderboard => ({
        gamemodeWorld: index("gamemodeWorld").on(leaderboard.gamemode, leaderboard.worldname),
        userId: index("userId").on(leaderboard.userId),
    }),
)

export interface ReplaySummary {
    id: string
    deaths: number
    gamemode: string
    rank: number
    ticks: number
    username: string
}

export const replayRank = sql<number>`
    ROW_NUMBER() OVER (
        PARTITION BY ${replays.worldname}, ${replays.gamemode} 
        ORDER BY ${replays.ticks} ASC
    )`

export const replaySummaryColumns = {
    id: replays.id,
    deaths: replays.deaths,
    gamemode: replays.gamemode,
    rank: replayRank,
    ticks: replays.ticks,
    username: users.username,
}

export function replaySummaryDTO(replay: ReplaySummary): ReplaySummaryDTO {
    return {
        id: replay.id,
        deaths: replay.deaths,
        rank: replay.rank,
        ticks: replay.ticks,
        username: replay.username,
    }
}

export function encodeReplayFrames(replayFrames: ReplayFrameDTO[]): Buffer {
    const packets = [
        ...packFloats(replayFrames.map(x => x.position.x)),
        ...packFloats(replayFrames.map(x => x.position.y)),
        ...packFloats(replayFrames.map(x => x.rotation)),
        ...packThrusts(replayFrames.map(x => x.thurst)),
    ]

    const packetsSize = packets.reduce((acc, x) => acc + x.size, 0)

    const buffer = Buffer.alloc(packetsSize)
    const view = new DataView(buffer.buffer)

    let offset = 0

    for (const packet of packets) {
        packet.write(view, offset)
        offset += packet.size
    }

    return buffer
}

export function decodeReplayFrames(buffer: Buffer): ReplayFrameDTO[] {
    const view = new DataView(buffer.buffer)

    const [x, offset0] = unpackFloats(view, 0)
    const [y, offset1] = unpackFloats(view, offset0)
    const [rotation, offset2] = unpackFloats(view, offset1)
    const [thrust, _] = unpackThrusts(view, offset2)

    const frames: ReplayFrameDTO[] = []

    for (let i = 0; i < x.length; ++i) {
        frames.push({
            position: {
                x: x[i],
                y: y[i],
            },
            rotation: rotation[i],
            thurst: thrust[i],
        })
    }

    return frames
}

function packFloats(floats: number[]): Packet[] {
    return [
        {
            write: (view, offset) => {
                view.setUint32(offset, floats.length, true)
            },
            size: 4,
        },
        {
            write: (view, offset) => {
                for (let i = 0; i < floats.length; i++) {
                    view.setFloat32(offset + i * 4, floats[i])
                }
            },
            size: floats.length * 4,
        },
    ]
}

function unpackFloats(view: DataView, offset: number): [number[], number] {
    const size = view.getUint32(offset)
    const result: number[] = []

    offset += 4

    for (let i = 0; i < size; ++i) {
        result.push(view.getFloat32(offset))
        offset += 4
    }

    return [result, offset]
}
