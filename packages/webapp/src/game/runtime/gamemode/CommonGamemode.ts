import { WorldModel } from "../../../model/world/WorldModel"
import { RuntimeConfig } from "../RuntimeConfig"
import { createCommonRuntimeHandlers, RuntimeHandler } from "../RuntimeHandler"
import { createMetaState, createRuntimeState, RuntimeState } from "../RuntimeState"
import { Gamemode } from "./Gamemode"

export class CommonGamemode implements Gamemode {
    createHandlers(config: RuntimeConfig, world: WorldModel): RuntimeHandler[] {
        return createCommonRuntimeHandlers(config)
    }

    createState(config: RuntimeConfig, world: WorldModel): RuntimeState {
        const meta = createMetaState(
            this.gravityHorizontal,
            this.gravityVertical,
            this.tickRate,
            this.tickRateLag
        )

        return createRuntimeState(
            meta,
            world,
        )
    }

    private readonly gravityVertical = -20
    private readonly gravityHorizontal = 0

    private readonly tickRate = 16.6667
    private readonly tickRateLag = 1
}
