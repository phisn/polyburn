import RAPIER from "@dimforge/rapier2d-compat"

import { Point } from "../../../../model/world/Point"
import { RuntimeMetaState } from "../../RuntimeState"

export class RuntimeParticle {
    get body(): RAPIER.RigidBody { return this._body }
    get age(): number { return this.time / this.lifeTime }

    constructor(
        private meta: RuntimeMetaState,
        
        position: Point,
        velocity: Point,
        radius: number,

        private lifeTime: number
    ) {
        this._body = meta.rapier.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic()
                .setTranslation(position.x, position.y)
                .setLinvel(velocity.x, velocity.y)
                .lockRotations()
        )

        const colliderDesc = RAPIER.ColliderDesc.ball(radius)
        
        meta.rapier.createCollider(
            colliderDesc,
            this._body
        )
    }

    // returns true if the particle is dead
    next(): boolean {
        if (this.time + 1 >= this.lifeTime) {
            this.meta.rapier.removeRigidBody(this.body)

            return true
        }
        
        this.time += 1

        return false
    }

    private time = 0
    private _body: RAPIER.RigidBody
}
