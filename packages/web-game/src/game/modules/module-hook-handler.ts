import { ExtendedRuntime } from "../runtime-extension/new-extended-runtime"

export class ModuleHookHandler {
    constructor(private runtime: ExtendedRuntime) {
        runtime.factoryContext.messageStore.listenTo("finished", () => {
            this.runtime.factoryContext.hooks?.onFinish()
        })
    }
}
