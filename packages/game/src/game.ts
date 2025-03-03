import { ModuleLevel } from "./modules/module-level"
import { ModuleRocket } from "./modules/module-rocket"
import { ModuleShape } from "./modules/module-shape"
import { ModuleWorld } from "./modules/module-world"
import { GameStore } from "./store"

export interface GameInput {
    rotation: number
    thrust: boolean
}

export class Game {
    private moduleLevel: ModuleLevel
    private moduleRocket: ModuleRocket
    private moduleShape: ModuleShape
    private moduleWorld: ModuleWorld

    constructor(private store: GameStore) {
        this.moduleLevel = new ModuleLevel(this.store)
        this.moduleRocket = new ModuleRocket(this.store)
        this.moduleShape = new ModuleShape(this.store)
        this.moduleWorld = new ModuleWorld(this.store)

        this.onReset()
    }

    public onUpdate(input: GameInput) {
        this.moduleLevel.onUpdate(input)
        this.moduleRocket.onUpdate(input)
        this.moduleWorld.onUpdate(input)
    }

    public onReset() {
        this.moduleWorld.onReset()

        this.moduleLevel.onReset()
        this.moduleRocket.onReset()
        this.moduleShape.onReset()
    }
}
