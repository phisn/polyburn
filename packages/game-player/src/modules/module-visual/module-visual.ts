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
    mapping: Map<number, Visuals>
}

export interface Visuals {
    object: THREE.Object3D
    resetInterpolation?: () => void
}

export class _ModuleVisual {
    private flags: Map<number, Flag>

    constructor(private store: GamePlayerStore) {
        store.resources.set("visuals", {
            mapping: new Map(),
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
            const rocket = new Rocket()
            return rocket
        })

        this.store.game.store.events.listen({
            death: ({ rocket }) => {
                const visuals = this.store.resources.get("visuals")
                const rocketVisual = visuals.mapping.get(rocket.id)

                if (rocketVisual === undefined) {
                    return
                }

                rocketVisual.resetInterpolation?.()
            },
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

                    let resetInterpolation: undefined | (() => void)

                    if (entity.has("body")) {
                        const body = entity.get("body")

                        if (body.isDynamic()) {
                            const interpolation = this.store.resources.get("interpolation")
                            const { reset } = interpolation.register(object, () => ({
                                point: {
                                    x: body.translation().x,
                                    y: body.translation().y,
                                },
                                rotation: body.rotation(),
                            }))

                            resetInterpolation = reset
                        }
                    }

                    const visuals = this.store.resources.get("visuals")
                    visuals.mapping.set(entity.id, {
                        object,
                        resetInterpolation,
                    })
                }
            },
            entity => {
                const visuals = this.store.resources.get("visuals")
                const visual = visuals.mapping.get(entity.id)

                if (visual) {
                    const scene = this.store.resources.get("scene")
                    scene.remove(visual.object)
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
