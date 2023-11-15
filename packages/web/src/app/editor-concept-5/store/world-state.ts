import { Entity } from "../entities/entity"
import { Gamemode } from "./world/gamemode"

export interface WorldState {
    gamemodes: Gamemode[]
    entities: Map<number, Entity>
}
