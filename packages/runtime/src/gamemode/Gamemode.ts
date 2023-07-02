
import { RuntimeComponents } from "../core/RuntimeComponents"
import { RuntimeFactoryContext } from "../core/RuntimeFactoryContext"
import { RuntimeSystemStack } from "../core/RuntimeSystemStack"
import { WorldModel } from "../model/world/WorldModel"

export type Gamemode = (factoryContext: RuntimeFactoryContext<RuntimeComponents>, world: WorldModel) => RuntimeSystemStack
