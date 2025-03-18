import { Mesh, MeshBasicMaterial, Object3D, PlaneGeometry } from "three"
import { subscribeMapChanges } from "../../store/model"
import { EditorStore } from "../../store/store"
import { VisualRocket } from "./visual-rocket"
import { VisualShape } from "./visual-shape"

export class ModuleCanvas {
    private visuals: Map<number, Object3D>
    private unsubscribe: (() => void)[]

    constructor(private store: EditorStore) {
        this.visuals = new Map()
        this.unsubscribe = []

        const model = store.resources.get("model")
        const scene = store.resources.get("scene")

        this.unsubscribe.push(
            subscribeMapChanges({
                value: model.entityBundles,
                added: key => {
                    const bundle = model.entityBundles.get(key)

                    switch (bundle?.type) {
                        case "level":
                            break
                        case "rocket": {
                            const visual = new VisualRocket(store, bundle)
                            scene.add(visual)
                            this.visuals.set(key, visual)

                            break
                        }
                        case "shape": {
                            const visual = new VisualShape(store, bundle)
                            scene.add(visual)
                            this.visuals.set(key, visual)

                            break
                        }
                    }
                },
                removed: key => {
                    console.log("delete")
                    const visual = this.visuals.get(key)

                    if (visual) {
                        scene.remove(visual)
                        this.visuals.delete(key)
                    }
                },
            }),
        )

        const geometry = new PlaneGeometry(1, 1)
        const material = new MeshBasicMaterial({ color: 0x00ff00 })
        const square = new Mesh(geometry, material)

        scene.add(square)
    }

    onDispose() {
        for (const unsubscribe of this.unsubscribe) {
            unsubscribe()
        }
    }
}
