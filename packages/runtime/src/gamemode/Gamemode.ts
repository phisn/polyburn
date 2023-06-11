import { EntityStore } from "../../../runtime-framework/src"
import { Meta } from "../core/Meta"
import { RuntimeSystemStack } from "../core/RuntimeSystemStack"
import { WorldModel } from "../model/world/WorldModel"

export type Gamemode = (meta: Meta, store: EntityStore, world: WorldModel) => RuntimeSystemStack
