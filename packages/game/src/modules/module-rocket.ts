import { EntityWith } from "../framework/entity"
import { GameInput } from "../game"
import { GameComponents, GameStore } from "../model/store"

export interface RocketComponent {
    thrust: boolean
}

export const rocketComponents = ["rocket", "rigid"] satisfies (keyof GameComponents)[]
export type RocketEntity = EntityWith<GameComponents, (typeof rocketComponents)[number]>

export class ModuleRocket {
    private getRocket: () => RocketEntity

    constructor(private store: GameStore) {
        this.getRocket = store.entities.single(...rocketComponents)
    }

    onReset() {}

    onUpdate({ thrust }: GameInput) {
        const rocket = this.getRocket()

        rocket.get("rocket").thrust = thrust
    }
}
