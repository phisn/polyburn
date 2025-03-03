import { levelComponents } from "game/src/modules/module-level"
import { rocketComponents } from "game/src/modules/module-rocket"
import { shapeComponents } from "game/src/modules/module-shape"
import * as THREE from "three"
import { PresentationStore } from "../../store"
import { MutatableShapeGeometry } from "./mutatable-shape-geometry"
import { Flag, Flag as ObjectFlag } from "./objects/object-flag"
import { Rocket as ObjectRocket } from "./objects/object-rocket"

export class ModuleVisual {
    constructor(private store: PresentationStore) {
        const scene = store.resources.get("scene")

        store.entities.listen(
            levelComponents,
            entity => {
                const level = entity.get("level")
                const transform = entity.get("transform")

                if (level.start) {
                    return
                }

                const flagObject = new ObjectFlag(transform)
                scene.add(flagObject)

                entity.set("visual", flagObject)
            },
            entity => {
                if (entity.has("visual") === false) {
                    return
                }

                scene.remove(entity.get("visual"))
            },
        )

        console.log("before listen")

        store.entities.listen(
            rocketComponents,
            entity => {
                console.log("got add")
                const transform = entity.get("transform")
                const rocketObject = new ObjectRocket()

                rocketObject.position.set(transform.point.x, transform.point.y, 0)
                rocketObject.rotation.set(0, 0, transform.rotation)

                scene.add(rocketObject)
                entity.set("visual", rocketObject)
            },
            entity => {
                console.log("got remove")
                if (entity.has("visual") === false) {
                    return
                }

                scene.remove(entity.get("visual"))
            },
        )

        console.log("after listen")

        store.entities.listen(
            shapeComponents,
            entity => {
                const shapeGeometry = new MutatableShapeGeometry(
                    entity.get("shape").vertices.map(vertex => ({
                        position: new THREE.Vector2(vertex.position.x, vertex.position.y),
                        color: vertex.color,
                    })),
                )

                const shapeMaterial = new THREE.MeshBasicMaterial({ vertexColors: true })
                const shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial)

                shapeMaterial.depthTest = false

                scene.add(shapeMesh)
                entity.set("visual", shapeMesh)
            },
            entity => {
                if (entity.has("visual") === false) {
                    return
                }

                scene.remove(entity.get("visual"))
            },
        )

        store.events.listen({
            captureChanged: ({ level, started }) => {
                if (level.has("visual")) {
                    const visual = level.get("visual")

                    if (visual instanceof Flag) {
                        visual.setActive(started)
                    }
                }
            },
        })
    }
}
