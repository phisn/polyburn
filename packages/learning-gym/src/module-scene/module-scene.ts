import { SystemStack } from "runtime-framework"
import { RuntimeComponents } from "runtime/src/core/runtime-components"
import { RuntimeFactoryContext } from "runtime/src/core/runtime-factory-context"
import { RuntimeSystemContext } from "runtime/src/core/runtime-system-stack"
import { Runtime } from "runtime/src/runtime"
import * as THREE from "three"
import { MutatableShapeGeometry } from "./mutatable-shape-geometry"
import { Flag } from "./objects/flag"
import { Rocket } from "./objects/rocket"

export class ModuleScene {
    private flags: Flag[] = []
    private rocket: Rocket

    constructor(
        private scene: THREE.Scene,
        private runtime: Runtime,
    ) {
        const [rocketEntity] = runtime.factoryContext.store.find("rocket", "rigidBody")
        this.rocket = new Rocket(rocketEntity)
        this.scene.add(this.rocket)

        this.initShapes(runtime)

        for (const levelEntity of runtime.factoryContext.store.find("level")) {
            if (levelEntity.components.level.hideFlag) {
                continue
            }

            const flag = new Flag(levelEntity)
            scene.add(flag)
            this.flags.push(flag)
        }
    }

    private initShapes(
        runtime: SystemStack<RuntimeFactoryContext<RuntimeComponents>, RuntimeSystemContext>,
    ) {
        const shapes = runtime.factoryContext.store.newSet("shape")

        for (const shape of shapes) {
            const shapeGeometry = new MutatableShapeGeometry(
                shape.components.shape.vertices.map(vertex => ({
                    position: new THREE.Vector2(vertex.position.x, vertex.position.y),
                    color: 0xff0000,
                })),
            )
            const shapeMaterial = new THREE.MeshBasicMaterial({ vertexColors: true })
            const shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial)

            this.scene.add(shapeMesh)
        }
    }

    onUpdate() {
        this.rocket.onUpdate()
    }

    getScene() {
        return this.scene
    }
}
