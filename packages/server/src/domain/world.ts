// import { WorldIdentifier } from "shared/src/worldidentifier"

export interface WorldIdentifier {
    name: string
    version: number
}

export interface World {
    id: WorldIdentifier
    model: string
    gamemodes: string[]
}
