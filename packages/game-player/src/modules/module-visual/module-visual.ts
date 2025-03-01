import * as THREE from "three"
import { GamePlayerStore } from "../../model/store"
import { MutatableShapeGeometry } from "./mutatable-shape-geometry"
import { Flag, Flag as ObjectFlag } from "./objects/object-flag"
import { Rocket as ObjectRocket } from "./objects/object-rocket"

export class ModuleVisual {
    constructor(private store: GamePlayerStore) {
        const scene = store.resources.get("scene")

        store.entities.listen(
            ["level", "transform"],
            entity => {
                const level = entity.get("level")
                const transform = entity.get("transform")

                if (level.first) {
                    return
                }

                const flagObject = new ObjectFlag(transform)
                scene.add(flagObject)

                entity.set("three", flagObject)
            },
            entity => {
                if (entity.has("three") === false) {
                    return
                }

                scene.remove(entity.get("three"))
            },
        )

        store.entities.listen(
            ["rocket", "transform"],
            entity => {
                console.log("got notified")
                const transform = entity.get("transform")
                const rocketObject = new ObjectRocket()

                rocketObject.position.set(transform.point.x, transform.point.y, 0)
                rocketObject.rotation.set(0, 0, transform.rotation)

                scene.add(rocketObject)
                entity.set("three", rocketObject)
            },
            entity => {
                console.log("remove oiajsdoiasjd")
                if (entity.has("three") === false) {
                    return
                }

                scene.remove(entity.get("three"))
            },
        )

        store.entities.listen(
            ["shape"],
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
                entity.set("three", shapeMesh)
            },
            entity => {
                if (entity.has("three") === false) {
                    return
                }

                scene.remove(entity.get("three"))
            },
        )

        store.events.listen({
            captureChanged: ({ level, started }) => {
                if (level.has("three")) {
                    const three = level.get("three")

                    if (three instanceof Flag) {
                        three.setActive(started)
                    }
                }
            },
        })
    }
}
