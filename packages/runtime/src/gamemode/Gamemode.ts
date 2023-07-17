import { RuntimeComponents } from "../core/RuntimeComponents"
import { RuntimeFactoryContextBooting } from "../core/RuntimeFactoryContext"
import { RuntimeSystemStack } from "../core/RuntimeSystemStack"
import { WorldModel } from "../model/world/WorldModel"

/* 
refactor of gamemodes: 
    gamemodes only exist in the map data. gamemodes are not static. a map can specify mutliple gamemodes. 
    the entities in a map can contain restrictions on what gamemodes they can be in.
    the restriction can be a allow or deny list of gamemodes. by specifying different flags and rockets 
    in the map, you can create a map that can be played in different ways. 

    additionally the editor will support a filter option. this filter option will filter all entities by 
    specifying a gamemode and only show entities that will also be visible in that gamemode.

    idea: refactor shapes to be a entities so that they can be filtered by gamemode. 

    additional refactor: the properties of a rocket are specified by the flag they spawn on.
*/

export type Gamemode = (
    factoryContext: RuntimeFactoryContextBooting<RuntimeComponents>,
    world: WorldModel,
) => RuntimeSystemStack
