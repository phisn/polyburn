import { WorldIdentifier } from "../WorldIdentifier"
import { GamemodeView } from "./GamemodeView"

export interface WorldView {
    id: WorldIdentifier
    model: string
    gamemodes: GamemodeView[]
}
