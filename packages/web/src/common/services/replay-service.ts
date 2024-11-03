import Dexie from "dexie"
import { ReplayDTO, ReplaySummaryDTO } from "shared/src/server/replay"
import { useAuthStore } from "../store/auth-store"
import { rpc } from "./rpc"

const db = new Dexie("polyburn-cache-replays") as Dexie & {
    replays: Dexie.Table<ReplayDTO>
    replaySummaries: Dexie.Table<ReplaySummaryDTO>
}

db.version(1).stores({
    replays: "id, gamemode, username, worldname",
    replaySummaries: "id, gamemode, username, worldname",
})

export interface ExReplaySummaryDTO extends ReplaySummaryDTO {
    replayAvailable: boolean
}

export class ReplayService {
    constructor() {}

    async sync() {}

    async list(worldname: string): Promise<ExReplaySummaryDTO[]> {
        if (useAuthStore.getState().currentUser === undefined) {
            const replays = await db.replaySummaries
                .where("worldname")
                .equals(worldname)
                .limit(25)
                .toArray()

            return Promise.all(
                replays.map(async x => ({
                    ...x,
                    replayAvailable: await db.replays
                        .where("id")
                        .equals(x.id)
                        .count()
                        .then(x => x > 0),
                })),
            )
        }

        const response = await rpc.replay.world.$get({
            query: {
                worldname,
            },
        })

        if (!response.ok) {
            throw new Error("Failed to fetch replays")
        }

        const responseJson = await response.json()

        for (const summary of responseJson.replays) {
            db.replaySummaries.put(summary)
        }

        return responseJson.replays.map(x => ({
            ...x,
            replayAvailable: true,
        }))
    }

    async get(id: string): Promise<ReplayDTO> {
        if (useAuthStore.getState().currentUser === undefined) {
            const replay = await db.replays.get(id)

            if (replay === undefined) {
                throw new Error("Replay not found")
            }

            return replay
        }

        const response = await rpc.replay.$get({
            query: {
                replayId: id,
            },
        })

        if (!response.ok) {
            throw new Error("Failed to fetch replay")
        }

        const replay = await response.json()

        db.replays.put(replay)

        return replay
    }
}

export const replayService = new ReplayService()
