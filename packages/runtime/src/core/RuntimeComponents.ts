import { EmptyComponent } from "runtime-framework"

import { EntityTypeComponent } from "./common/components/EntityTypeComponent"
import { RigidBodyComponent } from "./common/components/RigidBodyComponent"
import { LevelComponent } from "./level/LevelComponent"
import { LevelCapturingComponent } from "./level-capture/LevelCapturingComponent"
import { RocketComponent } from "./rocket/RocketComponent"
import { ShapeComponent } from "./shape/ShapeComponent"
import { WorldComponent } from "./world/WorldComponent"

export interface RuntimeComponents {
    world?: WorldComponent

    level?: LevelComponent
    levelCapturing?: LevelCapturingComponent
    rocket?: RocketComponent
    shape?: ShapeComponent

    entityType?: EntityTypeComponent
    moving?: EmptyComponent
    rigidBody?: RigidBodyComponent
}
