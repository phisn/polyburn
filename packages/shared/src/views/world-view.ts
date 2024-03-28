import { WorldIdentifier } from "../world-identifier"
import { GamemodeView } from "./gamemode-view"

export interface WorldView {
    id: WorldIdentifier
    model: string
    gamemodes: GamemodeView[]
}
