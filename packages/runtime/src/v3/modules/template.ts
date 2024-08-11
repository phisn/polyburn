import { ModuleStore } from "runtime-framework/src/module"
import { RuntimeBehaviors } from "../behaviors"

export function _moduleTemplate(store: ModuleStore<RuntimeBehaviors>) {
    const _rapier = store.single("runtimeDependencies")().runtimeDependencies.rapier

    return store.register(
        {
            onRuntimeTick() {},
        },
        function onDispose() {},
    )
}
