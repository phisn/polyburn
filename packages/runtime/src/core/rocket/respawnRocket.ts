import { RuntimeEntity } from "runtime-framework"

import { RigidbodyComponent } from "../common/components/RigidbodyComponent"
import { Components } from "./../Components"
import { RocketComponent } from "./RocketComponent"

export function respawnRocket(entity: RuntimeEntity) {
    const rigid = entity.get<RigidbodyComponent>(Components.Rigidbody)
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
