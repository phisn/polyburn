import { ExtendedRuntime } from "../runtime-extension/new-extended-runtime"

export class ModuleHookHandler {
    constructor(private runtime: ExtendedRuntime) {
        console.log("ModuleHookHandler: ", this.runtime.factoryContext.hooks)
        runtime.factoryContext.messageStore.listenTo("finished", () => {
            console.log("1: ", this.runtime.factoryContext.hooks)
            console.log("2: ", this.runtime.factoryContext.hooks?.onFinished)

            this.runtime.factoryContext.hooks?.onFinished?.(runtime)
        })
    }
}
