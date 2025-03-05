import { Object3D } from "three"
import { proxy } from "valtio"
import { subscribeMapChanges } from "../../store/model"
import { EditorStore } from "../../store/store"
import { VisualRocket } from "./visual-rocket"

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
                            const visual = new VisualRocket(bundle)
                            scene.add(visual)
                            this.visuals.set(key, visual)

                            break
                        }
                        case "shape":
                            break
                    }
                },
                removed: key => {
                    const visual = this.visuals.get(key)

                    if (visual) {
                        scene.remove(visual)
                        this.visuals.delete(key)
                    }
                },
            }),
        )

        model.entityBundles.set(0, {
            type: "rocket",
            rocket: store.entities.create({
                identity: proxy({
                    bundleId: 0,
                    type: "object",
                }),
                transform: proxy({
                    point: {
                        x: 0,
                        y: 0,
                    },
                    rotation: 0,
                }),
            }),
        })

        /*
        const geometry = new THREE.PlaneGeometry(1, 1)
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        const square = new THREE.Mesh(geometry, material)

        scene.add(square)
        */
    }

    onDispose() {
        for (const unsubscribe of this.unsubscribe) {
            unsubscribe()
        }
    }
}
