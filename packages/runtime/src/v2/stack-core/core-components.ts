import { EntityTypeComponent } from "./common/entity-type-component"
import { RigidBodyComponent } from "./common/rigidbody-component"
import { LevelComponent } from "./level/level-component"
import { RocketComponent } from "./rocket/rocket-component"
import { ConfigComponent } from "./world/config-component"
import { RapierComponent } from "./world/rapier-component"

export interface CoreComponents {
    type: EntityTypeComponent
    rocket: RocketComponent
    level: LevelComponent

    rigidbody: RigidBodyComponent

    config: ConfigComponent
    rapier: RapierComponent
}
