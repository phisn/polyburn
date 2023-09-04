import { WorldIdentifier } from "shared/src/WorldIdentifier"

export interface World {
    id: WorldIdentifier
    model: string
    gamemodes: string[]
}
