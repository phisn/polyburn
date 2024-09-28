import { EntityWith } from "game/src/framework/entity"
import { GameComponents } from "game/src/model/store"
import { levelComponents } from "game/src/modules/module-level"
import { rocketComponents } from "game/src/modules/module-rocket"
import * as THREE from "three"
import { GamePlayerStore } from "../../model/store"
import { MutatableShapeGeometry } from "./mutatable-shape-geometry"
import { Flag } from "./objects/flag"
import { Rocket } from "./objects/rocket"

export interface VisualsResource {
    objects: Map<number, THREE.Object3D>
}

export class ModuleVisual {
    private flags: Map<number, Flag>

    constructor(private store: GamePlayerStore) {
        store.resources.set("visuals", {
            objects: new Map(),
        })

        this.flags = new Map()

        this.attachVisual(["shape"], entity => {
            const shapeGeometry = new MutatableShapeGeometry(
                entity.get("shape").vertices.map(vertex => ({
                    position: new THREE.Vector2(vertex.position.x, vertex.position.y),
                    color: vertex.color,
                })),
            )

            const shapeMaterial = new THREE.MeshBasicMaterial({ vertexColors: true })
            const shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial)

            shapeMaterial.depthTest = false
            return shapeMesh
        })

        this.attachVisual(
            levelComponents,
            entity => {
                if (entity.get("level").start) {
                    return
                }

                const flag = new Flag(entity)
                this.flags.set(entity.id, flag)
                return flag
            },
            entity => {
                this.flags.delete(entity.id)
            },
        )

        this.attachVisual(rocketComponents, () => {
            return new Rocket()
        })
    }

    private attachVisual<K extends (keyof GameComponents)[]>(
        requirements: K,
        construct: (entity: EntityWith<GameComponents, K[number]>) => THREE.Object3D | undefined,
        destruct?: (entity: EntityWith<GameComponents, K[number]>) => void,
    ) {
        this.store.game.store.entities.listen(
            requirements,
            entity => {
                const object = construct(entity)

                if (object) {
                    const scene = this.store.resources.get("scene")
                    scene.add(object)

                    const visuals = this.store.resources.get("visuals")
                    visuals.objects.set(entity.id, object)

                    if (entity.has("body")) {
                        const body = entity.get("body")

                        if (body.isDynamic()) {
                            const interpolation = this.store.resources.get("interpolation")
                            interpolation.register(object, () => ({
                                point: {
                                    x: body.translation().x,
                                    y: body.translation().y,
                                },
                                rotation: body.rotation(),
                            }))
                        }
                    }
                }
            },
            entity => {
                const visuals = this.store.resources.get("visuals")
                const object = visuals.objects.get(entity.id)

                if (object) {
                    const scene = this.store.resources.get("scene")
                    scene.remove(object)
                }

                if (destruct) {
                    destruct(entity)
                }
            },
        )
    }

    onUpdate() {
        for (const flag of this.flags.values()) {
            flag.onUpdate()
        }
    }
}
