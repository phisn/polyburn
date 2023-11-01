import { Entity } from "../../entities/entity"
import { Gamemode } from "./gamemode"

export interface EditorStoreWorldState {
    gamemodes: Gamemode[]
    entities: Map<number, Entity>
}
