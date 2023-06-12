import { CollisionEventComponent } from "./common/components/CollisionEventComponent"
import { EntityTypeComponent } from "./common/components/EntityTypeComponent"
import { RigidBodyComponent } from "./common/components/RigidBodyComponent"
import { RocketComponent } from "./rocket/RocketComponent"

export interface RuntimeComponents {
    rocket?: RocketComponent

    collisionEvent?: CollisionEventComponent
    entityType?: EntityTypeComponent
    rigidBody?: RigidBodyComponent
}
