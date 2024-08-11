import RAPIER from "@dimforge/rapier2d"
import { ModuleStore } from "runtime-framework/src/module"
import { RuntimeBehaviors } from "../behaviors"

export interface ModuleWorld {
    rapierWorld: RAPIER.World
    rapierQueue: RAPIER.EventQueue

    age: number
    deaths: number
}

export function moduleWorld(store: ModuleStore<RuntimeBehaviors>) {
    const dependencyModule = store.single("runtimeDependencies")
    const rapier = dependencyModule().runtimeDependencies.rapier

    const world: ModuleWorld = {
        rapierWorld: new rapier.World(new rapier.Vector2(0, 0)),
        rapierQueue: new rapier.EventQueue(true),

        age: 0,
        deaths: 0,
    }

    return store.register(
        {
            world,
            onRuntimeTick() {
                world.rapierWorld.step(world.rapierQueue)
                world.age++
            },
            onRocketDeath() {
                world.deaths++
            },
        },
        function onDispose() {
            world.rapierWorld.free()
        },
    )
}
