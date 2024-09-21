import { EntityWith } from "../framework/entity"
import { GameInput } from "../game"
import { GameComponents, GameStore } from "../model/store"

export interface LevelComponent {}

export const levelComponents = ["level", "rigid"] satisfies (keyof GameComponents)[]
export type LevelEntity = EntityWith<GameComponents, (typeof levelComponents)[number]>

export class ModuleLevel {
    constructor(private store: GameStore) {}

    onReset() {}

    onUpdate(_input: GameInput) {}
}
