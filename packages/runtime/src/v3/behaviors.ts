import { Point } from "../model/point"
import { RuntimeDependencies } from "./dependencies"
import { Collidable } from "./modules/module-colision"
import { EntityRocket } from "./modules/module-rocket/module-rocket"
import { ModuleWorld } from "./modules/module-world"

export type Entity = EntityRocket

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
        contactPoint: Point
        normal: Point
    }): void

    collidable: Collidable
    entity: Entity
    runtimeDependencies: RuntimeDependencies
    world: ModuleWorld
}
