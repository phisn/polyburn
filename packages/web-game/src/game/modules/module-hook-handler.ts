import { Buffer } from "buffer"
import { ReplayModel } from "runtime/proto/replay"
import { ExtendedRuntime } from "../runtime-extension/new-extended-runtime"

export class ModuleHookHandler {
    constructor(private runtime: ExtendedRuntime) {
        console.log("ModuleHookHandler: ", this.runtime.factoryContext.hooks)
        runtime.factoryContext.messageStore.listenTo("finished", () => {
            // protoc replaymodel to base64 bytes
            const replaymodel = this.runtime.factoryContext.replayCapture.replay
            const raw = ReplayModel.encode(replaymodel).finish()
            const base64 = Buffer.from(raw).toString("base64")
            console.log("ReplayModel: ", base64)

            this.runtime.factoryContext.hooks?.onFinished?.(runtime)
        })
    }
}
