import { EmptyComponent } from "runtime-framework"

import { CollisionEventComponent } from "./common/components/CollisionEventComponent"
import { EntityTypeComponent } from "./common/components/EntityTypeComponent"
import { RigidBodyComponent } from "./common/components/RigidBodyComponent"
import { LevelComponent } from "./level/LevelComponent"
import { RocketComponent } from "./rocket/RocketComponent"

export interface RuntimeComponents {
    level?: LevelComponent
    rocket?: RocketComponent

    collisionEvent?: CollisionEventComponent
    entityType?: EntityTypeComponent
    rigidBody?: RigidBodyComponent

    moving?: EmptyComponent
    collisionEventListener?: EmptyComponent   
}
