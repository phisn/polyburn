import { Entity } from "../../../../runtime-framework/src"
import { RigidBodyComponent } from "../common/components/RigidBodyComponent"
import { Components } from "../Components"
import { RocketComponent } from "./RocketComponent"

export function respawnRocket(entity: Entity) {
    const rigid = entity.get<RigidBodyComponent>(Components.RigidBody)
    const rocket = entity.get<RocketComponent>(Components.Rocket)

    if (!rigid || !rocket) {
        console.error("respawnRocket: entity missing rigidbody or rocket component")
        return
    }

    rigid.body.setTranslation(rocket.spawnPosition, true)
    rigid.body.setRotation(rocket.spawnRotation, true)

    rigid.body.setLinvel({ x: 0, y: 0 }, true)
    rigid.body.setAngvel(0, true)
}
