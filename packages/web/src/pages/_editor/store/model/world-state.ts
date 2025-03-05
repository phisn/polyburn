import { Entity } from "../../entities/entity"
import { Gamemode } from "./gamemode"

export interface WorldState {
    gamemodes: Gamemode[]
    entities: Map<number, Entity>
}
