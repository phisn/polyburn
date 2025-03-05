import { Object3D } from "three"
import { subscribe } from "valtio"
import { EntityBundleRocket } from "../../store/model"
import { ObjectRocket } from "./object-rocket"

export class VisualRocket extends Object3D {
    constructor(bundle: EntityBundleRocket) {
        super()

        const rocket = new ObjectRocket()
        const transform = bundle.rocket.get("transform")

        console.log(rocket.position, rocket.rotation)

        const callback = () => {
            rocket.position.set(transform.point.x, transform.point.y, 0)
            rocket.rotation.set(0, 0, transform.rotation)

            console.log(transform.point, transform.rotation)
        }

        subscribe(transform, callback)
        callback()

        this.add(rocket)
    }
}
