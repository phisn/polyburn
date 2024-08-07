import { ModuleStore } from "runtime-framework/src/module"
import { RuntimeBehaviors } from "../behaviors"

export function _moduleTemplate(store: ModuleStore<RuntimeBehaviors>) {
    const dependencyModule = store.single("runtimeDependencies")
    const _rapier = dependencyModule().runtimeDependencies.rapier

    return store.register(
        {
            onRuntimeTick() {},
        },
        function onDispose() {},
    )
}
