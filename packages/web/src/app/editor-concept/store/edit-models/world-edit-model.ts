import { EntityEditModel } from "./entity-edit-model"

export interface GamemodeEditModel {
    name: string
    groups: string[]
}

export interface WorldEditModel {
    gamemodes: GamemodeEditModel[]
    entities: Map<number, EntityEditModel>
}
