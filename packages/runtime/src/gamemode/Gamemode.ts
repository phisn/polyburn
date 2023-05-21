import { RuntimeStore } from "runtime-framework"

import { Meta } from "../core/Meta"
import { SystemContext } from "../core/SystemContext"
import { WorldModel } from "../model/world/WorldModel"

export type Gamemode = (meta: Meta, store: RuntimeStore<SystemContext>, world: WorldModel) => void
