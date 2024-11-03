import Dexie from "dexie"
import { WorldDTO } from "shared/src/server/world"
import { useAuthStore } from "../store/auth-store"
import { rpc } from "./rpc"

const db = new Dexie("polyburn-cache-worlds") as Dexie & {
    worlds: Dexie.Table<WorldDTO>
}

db.version(1).stores({
    worlds: "worldname",
})

export class WorldService {
    constructor() {}

    async sync() {}

    async list(): Promise<WorldDTO[]> {
        if (useAuthStore.getState().currentUser === undefined) {
            return db.worlds.limit(25).toArray()
        }

        const response = await rpc.world.$get({ query: {} })

        if (!response.ok) {
            throw new Error("Failed to fetch replays")
        }

        const responseJson = await response.json()

        for (const world of responseJson.worlds) {
            db.worlds.put(world)
        }

        return responseJson.worlds.map(x => ({
            ...x,
            replayAvailable: true,
        }))
    }
}

export const worldService = new WorldService()
