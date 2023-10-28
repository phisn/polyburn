import { Entity } from "./entity"
import { Gamemode } from "./gamemode"

export interface EditorWorldState {
    gamemodes: Gamemode[]
    entities: Map<number, Entity>
}
