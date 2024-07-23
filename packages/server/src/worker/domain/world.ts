import { WorldId } from "shared/src/worker-api/world-id"

export interface World {
    id: WorldId
    model: string
    gamemodes: string[]
}
