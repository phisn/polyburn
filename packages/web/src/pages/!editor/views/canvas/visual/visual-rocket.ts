/*
import { Object3D } from "three"
import { subscribe } from "valtio"
import { EntityBundleRocket } from "../../store/model"
import { EditorStore } from "../../store/store"
import { ObjectRocket } from "./object-rocket"

export class VisualRocket extends Object3D {
    constructor(store: EditorStore, bundle: EntityBundleRocket) {
        super()

        const focus = store.resources.get("focus")
        const transform = bundle.rocket.get("transform")

        const rocket = new ObjectRocket()
        this.add(rocket)

        const callbackTransform = () => {
            rocket.position.set(transform.point.x, transform.point.y, 0)
            rocket.rotation.set(0, 0, transform.rotation)
        }

        subscribe(transform, callbackTransform)
        callbackTransform()

        const callbackFocus = () => {
            if (focus.bundlesSelected.has(bundle.id)) {
                rocket.setColor("#ffbb00")
            } else if (focus.bundlesHighlighted.has(bundle.id)) {
                rocket.setColor("#ffdd66")
            } else {
                rocket.setColor()
            }
        }

        subscribe(focus, callbackFocus)
    }
}
*/
