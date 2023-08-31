import { WorldIdentifier } from "shared/src/worldidentifier"

export interface World {
    id: WorldIdentifier
    model: string
    gamemodes: string[]
}
