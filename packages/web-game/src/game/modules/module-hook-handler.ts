import { ExtendedRuntime } from "../runtime-extension/new-extended-runtime"

export class ModuleHookHandler {
    constructor(private runtime: ExtendedRuntime) {
        runtime.factoryContext.messageStore.listenTo("finished", () => {
            /*
            // protoc replaymodel to base64 bytes
            const replaymodel = this.runtime.factoryContext.replayCapture.replay
            const raw = ReplayModel.encode(replaymodel).finish()
            const base64 = Buffer.from(raw).toString("base64")
            console.log("ReplayModel: ", base64)
            */

            this.runtime.factoryContext.settings.hooks?.onFinished?.(runtime)
        })
    }
}
