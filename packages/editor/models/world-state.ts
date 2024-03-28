import { EntityState } from "./entity-state"

export interface GamemodeState {
    name: string
    groups: string[]
}

export interface WorldState {
    gamemodes: GamemodeState[]
    entities: Map<number, EntityState>
}
