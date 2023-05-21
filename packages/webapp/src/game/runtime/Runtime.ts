
import { WorldModel } from "../../model/world/WorldModel"
import { Gamemode } from "./gamemode/Gamemode"
import { RuntimeConfig } from "./RuntimeConfig"
import { RuntimeHandler } from "./RuntimeHandler"
import { RuntimeState } from "./RuntimeState"
import { StepContext } from "./StepContext"

export class Runtime {
    get state() { return this._state }

    constructor(
        config: RuntimeConfig,
        world: WorldModel,
        gamemode: Gamemode
    ) {
        this._handlers = gamemode.createHandlers(config, world)
        this._state = gamemode.createState(config, world)
    }

    step(context: StepContext) {
        for (const handler of this._handlers) {
            handler(this._state, context)
        }

        this._state.meta.rapier.step(this._state.meta.queue)
        this._state.meta.futures.step()
    }

    private _handlers: RuntimeHandler[]
    private _state: RuntimeState
}
