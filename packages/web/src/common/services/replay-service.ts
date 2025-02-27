import Dexie from "dexie"
import { ReplayInputModel } from "game/proto/replay"
import { bytesToBase64 } from "game/src/model/utils"
import { ReplayDTO, ReplaySummaryDTO } from "shared/src/server/replay"
import { useGlobalStore } from "../store"
import { authService } from "./auth-service"
import { rpc } from "./rpc"

interface PendingReplay {
    hash: string

    worldname: string
    gamemode: string

    input: Uint8Array
}

const db = new Dexie("polyburn-cache-replays") as Dexie & {
    pendingReplays: Dexie.Table<PendingReplay>
    replays: Dexie.Table<ReplayDTO>
    replaySummaries: Dexie.Table<ReplaySummaryDTO>
}

db.version(1).stores({
    pendingReplays: "hash",
    replays: "id, username, gamemode, worldname",
    replaySummaries: "id, username, gamemode, worldname",
})

export interface ExReplaySummaryDTO extends ReplaySummaryDTO {
    replayAvailable: boolean
    replayUploaded: boolean
}

export class ReplayService {
    // sometimes for whatever reason storage might not work. this is okay for map & replay caching
    // but should never prevent a player to upload a replay. therefore we save if inmemory if writing
    // to disk fails
    private pendingReplaysBackup: Map<string, PendingReplay>

    constructor() {
        this.pendingReplaysBackup = new Map()
    }

    async commit(
        worldname: string,
        gamemode: string,
        replayInput: ReplayInputModel,
    ): Promise<string> {
        const input = ReplayInputModel.encode(replayInput).finish()

        const hashBuffer = await crypto.subtle.digest("SHA-512", input)
        const hash = bytesToBase64(new Uint8Array(hashBuffer))

        const replay: PendingReplay = {
            hash,

            worldname,
            gamemode,

            input,
        }

        try {
            await db.pendingReplays.put(replay, hash)
        } catch (e) {
            useGlobalStore.getState().newAlert({
                type: "error",
                message: "Failed to write replay to disk, saved in memory",
            })

            console.error(e)

            this.pendingReplaysBackup.set(hash, replay)
        }

        return hash
    }

    async get(id: string): Promise<ReplayDTO> {
        try {
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
        } catch (e) {
            console.error(e)
        }

        const replay = await db.replays.get(id)

        if (replay === undefined) {
            throw new Error("Replay not found")
        }

        return replay
    }

    async list(worldname: string, gamemode: string): Promise<ExReplaySummaryDTO[]> {
        try {
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
                replayUploaded: true,
                replayAvailable: true,
            }))
        } catch (e) {
            console.error(e)
        }

        const replays = await db.replaySummaries.where({ gamemode, worldname }).sortBy("ticks")

        return Promise.all(
            replays.map(async x => ({
                ...x,
                replayUploaded: true,
                replayAvailable: await db.replays
                    .where("id")
                    .equals(x.id)
                    .count()
                    .then(x => x > 0),
            })),
        )
    }

    async sync() {
        if (authService.getState() !== "authenticated") {
            return
        }

        const toProcess = [
            ...(await db.pendingReplays.toArray()),
            ...this.pendingReplaysBackup.values(),
        ]

        for (const pendingReplay of toProcess) {
            try {
                await this.upload(pendingReplay.hash)
            } catch (e) {
                console.error(e)
            }
        }
    }

    async upload(replayHash: string) {
        let pendingReplay: PendingReplay | undefined = this.pendingReplaysBackup.get(replayHash)

        if (pendingReplay === undefined) {
            pendingReplay = await db.pendingReplays.get(replayHash)
        }

        if (pendingReplay === undefined) {
            console.warn("Tried to upload non-existing replay", replayHash)
            return
        }

        const response = await rpc.replay.$post({
            json: {
                worldname: pendingReplay.worldname,
                gamemode: pendingReplay.gamemode,

                input: bytesToBase64(pendingReplay.input),
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
