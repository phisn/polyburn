import { EmptyComponent } from "runtime-framework"
import { EntityTypeComponent } from "./common/components/entity-type-component"
import { RigidBodyComponent } from "./common/components/rigid-body-component"
import { LevelCapturingComponent } from "./level-capture/level-capturing-component"
import { LevelComponent } from "./level/level-component"
import { RocketComponent } from "./rocket/rocket-component"
import { ShapeComponent } from "./shape/shape-component"
import { WorldComponent } from "./world/world-component"

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
