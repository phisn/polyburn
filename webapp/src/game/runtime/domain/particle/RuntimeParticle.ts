import RAPIER from "@dimforge/rapier2d-compat"

import { Point } from "../../../../model/world/Point"
import { RuntimeMetaState } from "../../RuntimeState"

class RuntimeParticle {
    get body(): RAPIER.RigidBody { return this._body }

    constructor(
        private state: RuntimeMetaState,
        
        position: Point,
        velocity: Point,
        radius: number,

        private _lifetime: number
    ) {
        this._body = state.rapier.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(position.x, position.y)
                .setLinvel(velocity.x, velocity.y)
                .lockRotations()
        )

        const colliderDesc = RAPIER.ColliderDesc.ball(radius)
        
        const collider = state.rapier.createCollider(
            colliderDesc,
            this._body
        )
    }

    // returns true if the particle is dead
    age(): boolean {
        this._lifetime -= 1

        if (this._lifetime <= 0) {
            this.state.rapier.removeRigidBody(this.body)

            return true
        }

        return false
    }

    private _body: RAPIER.RigidBody
}
