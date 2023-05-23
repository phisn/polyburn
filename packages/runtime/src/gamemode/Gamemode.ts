import { EntityStore, SystemStack } from "runtime-framework"

import { Meta } from "../core/Meta"
import { SystemContext } from "../core/SystemContext"
import { WorldModel } from "../model/world/WorldModel"

export type Gamemode = (meta: Meta, store: EntityStore, world: WorldModel) => SystemStack<SystemContext>
