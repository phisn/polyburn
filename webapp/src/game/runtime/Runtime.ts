
import { WorldModel } from "../../model/world/WorldModel"
import { RuntimeConfig } from "./RuntimeConfig"
import { getRuntimeHandlers, RuntimeHandler } from "./RuntimeHandler"
import { RuntimeState } from "./RuntimeState"
import { StepContext } from "./StepContext"

export class Runtime {
    get state() { return this._state }

    constructor(
        config: RuntimeConfig,
        world: WorldModel
    ) {
        this._state = this.createRuntimeState(world)
        this._handlers = getRuntimeHandlers(config)
    }

    step(context: StepContext) {
        for (const handler of this._handlers) {
            handler(this.state, context)
        }

        this.state.meta.rapier.step(this.state.meta.queue)
        this.state.meta.futures.step()
    }

    private readonly gravityVertical = -20
    private readonly gravityHorizontal = 0

    private readonly tickRate = 16.6667
    private readonly tickRateLag = 1

    private _handlers: RuntimeHandler[]
    private _state: RuntimeState
}
