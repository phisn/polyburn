import Dexie from "dexie"
import { ReplayModel } from "game/proto/replay"
import { bytesToBase64 } from "game/src/model/utils"
import { ReplayDTO, ReplaySummaryDTO } from "shared/src/server/replay"
import { useAuthStore } from "../store/auth-store"
import { authService } from "./auth-service"
import { rpc } from "./rpc"

interface PendingReplay {
    hash: string

    worldname: string
    gamemode: string
    model: Uint8Array
}

const db = new Dexie("polyburn-cache-replays") as Dexie & {
    pendingReplays: Dexie.Table<PendingReplay>
    replays: Dexie.Table<ReplayDTO>
    replaySummaries: Dexie.Table<ReplaySummaryDTO>
}

db.version(1).stores({
    pendingReplays: "hash",
    replays: "id, gamemode, username, worldname",
    replaySummaries: "id, gamemode, username, worldname",
})

export interface ExReplaySummaryDTO extends ReplaySummaryDTO {
    replayAvailable: boolean
}

export class ReplayService {
    constructor() {}

    async commit(worldname: string, gamemode: string, replayModel: ReplayModel): Promise<string> {
        const model = ReplayModel.encode(replayModel).finish()
        const hashBuffer = await crypto.subtle.digest("SHA-512", model)
        const hash = bytesToBase64(new Uint8Array(hashBuffer))

        await db.pendingReplays.put(
            {
                hash,

                worldname,
                gamemode,
                model,
            },
            hash,
        )

        return hash
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

    async list(worldname: string, gamemode: string): Promise<ExReplaySummaryDTO[]> {
        if (useAuthStore.getState().currentUser === undefined) {
            const replays = await db.replaySummaries
                .where({ gamemode, worldname })
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
                gamemode,
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

    async sync() {
        if (authService.getState() !== "authenticated") {
            return
        }

        for (const pendingReplay of await db.pendingReplays.toArray()) {
            try {
                await this.upload(pendingReplay.hash)
            } catch (e) {
                console.error(e)
            }
        }
    }

    async upload(replayHash: string) {
        const pendingReplay = await db.pendingReplays.get(replayHash)

        if (pendingReplay === undefined) {
            return
        }

        const response = await rpc.replay.$post({
            json: {
                worldname: pendingReplay.worldname,
                gamemode: pendingReplay.gamemode,
                model: bytesToBase64(pendingReplay.model),
            },
        })

        if (response.ok === false) {
            throw new Error("Failed to upload replay")
        }

        db.pendingReplays.delete(replayHash)

        return await response.json()
    }
}

export const replayService = new ReplayService()
