import { EmptyComponent } from "runtime-framework"

import { CollisionComponent } from "./common/components/CollisionEventComponent"
import { EntityTypeComponent } from "./common/components/EntityTypeComponent"
import { RigidBodyComponent } from "./common/components/RigidBodyComponent"
import { LevelCapturingComponent } from "./level/LevelCapturingComponent"
import { LevelComponent } from "./level/LevelComponent"
import { RocketComponent } from "./rocket/RocketComponent"
import { ShapeComponent } from "./shape/ShapeComponent"

export interface RuntimeComponents {
    level?: LevelComponent
    levelCapturing?: LevelCapturingComponent
    rocket?: RocketComponent
    shape?: ShapeComponent

    collision?: CollisionComponent
    entityType?: EntityTypeComponent
    moving?: EmptyComponent
    rigidBody?: RigidBodyComponent
}
