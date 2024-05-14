import { WorldIdentifier } from "shared/src/world-identifier"

export interface World {
    id: WorldIdentifier
    model: string
    gamemodes: string[]
}
