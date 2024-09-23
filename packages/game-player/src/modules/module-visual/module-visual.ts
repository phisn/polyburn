import { EntityWith } from "game/src/framework/entity"
import { GameComponents } from "game/src/model/store"
import { levelComponents } from "game/src/modules/module-level"
import { rocketComponents } from "game/src/modules/module-rocket"
import * as THREE from "three"
import { GamePlayerStore } from "../../model/store"
import { MutatableShapeGeometry } from "./mutatable-shape-geometry"
import { Flag } from "./objects/flag"
import { Rocket } from "./objects/rocket"

export class ModuleVisual {
    private flags: Map<number, Flag> = new Map()
    private objects: Map<number, THREE.Object3D>

    constructor(private store: GamePlayerStore) {
        this.objects = new Map()

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
                const flag = this.flags.get(entity.id)

                if (flag) {
                    this.flags.delete(entity.id)
                }
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
                    this.objects.set(entity.id, object)
                    this.store.scene.add(object)
                }
            },
            entity => {
                const object = this.objects.get(entity.id)

                if (object) {
                    this.store.scene.remove(object)
                    this.objects.delete(entity.id)
                }

                if (destruct) {
                    destruct(entity)
                }
            },
        )
    }

    onUpdate() {
        for (const [, flag] of this.flags) {
            flag.onUpdate()
        }

        for (const [id, interpolation] of this.store.interpolation.interpolations()) {
            const object = this.objects.get(id)

            if (object) {
                object.position.x = interpolation.x
                object.position.y = interpolation.y
                object.rotation.z = interpolation.rotation
            }
        }
    }
}
