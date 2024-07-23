import { GamemodeInfo } from "./gamemode-info"
import { WorldId } from "./world-id"

export interface WorldInfoUnlocked {
    id: WorldId
    type: "unlocked"

    model: string
    image: string
    gamemodes: GamemodeInfo[]
}

export interface WorldInfoLocked {
    id: WorldId
    type: "locked"
    image: string
}

export type WorldInfo = WorldInfoUnlocked | WorldInfoLocked

export function isWorldUnlocked(world?: WorldInfo): world is WorldInfoUnlocked {
    return world?.type === "unlocked"
}

export function isWorldLocked(world?: WorldInfo): world is WorldInfoLocked {
    return world?.type === "locked"
}
