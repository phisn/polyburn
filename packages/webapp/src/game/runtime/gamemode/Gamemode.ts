import { WorldModel } from "../../../model/world/WorldModel"
import { RuntimeConfig } from "../RuntimeConfig"
import { RuntimeHandler } from "../RuntimeHandler"
import { RuntimeState } from "../RuntimeState"

export interface Gamemode {
    createHandlers(config: RuntimeConfig, world: WorldModel): RuntimeHandler[]
    createState(config: RuntimeConfig, world: WorldModel): RuntimeState
}
