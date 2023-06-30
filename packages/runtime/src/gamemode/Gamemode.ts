import { Meta } from "runtime/src/core/common/Meta"

import { EntityStore } from "../../../runtime-framework/src"
import { RuntimeComponents } from "../core/RuntimeComponents"
import { RuntimeSystemStack } from "../core/RuntimeSystemStack"
import { WorldModel } from "../model/world/WorldModel"

export type Gamemode = (meta: Meta, store: EntityStore<RuntimeComponents>, world: WorldModel) => RuntimeSystemStack
