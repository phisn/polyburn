import { Point } from "../model/point"
import { RuntimeDependencies } from "./dependencies"
import { Collidable } from "./modules/module-colision"
import { EntityLevel } from "./modules/module-level/module-level"
import { EntityRocket } from "./modules/module-rocket/module-rocket"
import { ModuleWorld } from "./modules/module-world"

export interface RuntimeInput {
    thrust: boolean
    rotation: number
}

export type RuntimeBehaviors = {
    runtimeReset(): void

    onRuntimeTick(props: { input: RuntimeInput }): void

    onRocketDeath(props: {
        position: Point
        rotation: number
        contactPoint?: Point
        normal?: Point
    }): void

    onLevelCaptured(props: { level: EntityLevel }): void

    collidable: Collidable
    runtimeDependencies: RuntimeDependencies
    world: ModuleWorld

    rocket: EntityRocket
    level: EntityLevel
}
