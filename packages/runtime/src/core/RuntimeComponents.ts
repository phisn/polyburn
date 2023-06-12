import { EmptyComponent } from "runtime-framework"

import { CollisionEventComponent } from "./common/components/CollisionEventComponent"
import { EntityTypeComponent } from "./common/components/EntityTypeComponent"
import { RigidBodyComponent } from "./common/components/RigidBodyComponent"
import { LevelComponent } from "./level/LevelComponent"
import { RocketComponent } from "./rocket/RocketComponent"
import { ShapeComponent } from "./shape/ShapeComponent"

export interface RuntimeComponents {
    level?: LevelComponent
    rocket?: RocketComponent
    shape?: ShapeComponent

    collisionEvent?: CollisionEventComponent
    collisionEventListener?: EmptyComponent
    entityType?: EntityTypeComponent
    moving?: EmptyComponent
    rigidBody?: RigidBodyComponent
}
