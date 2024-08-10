import { Module, ModuleStore } from "runtime-framework/src/module"
import { RuntimeBehaviors } from "../behaviors"
import { moduleWorld } from "../modules/module-world"

export interface RuntimeNormalConfig {}

export interface RuntimeNormal {}

export function moduleRuntimeNormal(store: ModuleStore<RuntimeBehaviors>) {
    let modules = create(store)

    function onDispose() {
        for (const module of modules.reverse()) {
            store.remove(module.id)
        }
    }

    const getRocket = () => store.single("rocket")().rocket

    return store.register(
        {
            runtimeReset() {
                onDispose()
                modules = create(store)
            },
            onLevelCaptured() {
                const rocket = getRocket()

                rocket.spawnPoint = rocket.rigidbody.translation()
                rocket.spawnRotation = rocket.rigidbody.rotation()
            },
        },
        onDispose,
    )
}

function create(store: ModuleStore<RuntimeBehaviors>) {
    const modules: Module[] = []

    modules.push(moduleWorld(store))

    return modules
}
