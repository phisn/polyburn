import { Entity } from "./entity"
import { Gamemode } from "./gamemode"

export interface EditorStoreState {
    gamemodes: Gamemode[]
    entities: Map<number, Entity>
    selected: number[]
}
