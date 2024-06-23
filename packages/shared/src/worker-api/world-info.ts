import { GamemodeInfo } from "./gamemode-info"
import { WorldId } from "./world-id"

export interface WorldInfo {
    id: WorldId
    model: string
    gamemodes: GamemodeInfo[]
}
