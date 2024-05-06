import { EntityWith, SystemStack } from "runtime-framework"
import { RuntimeComponents } from "runtime/src/core/runtime-components"
import { RuntimeFactoryContext } from "runtime/src/core/runtime-factory-context"
import { RuntimeSystemContext } from "runtime/src/core/runtime-system-stack"
import { Runtime } from "runtime/src/runtime"
import * as THREE from "three"
import { MutatableShapeGeometry } from "./mutatable-shape-geometry"
import { Flag } from "./objects/flag"
import { Rocket } from "./objects/rocket"

export class ModuleSceneAgent {
    private flags: Flag[] = []
    private rocket: Rocket

    private previousCurrentLevel?: EntityWith<RuntimeComponents, "level">

    private upBound: THREE.Mesh
    private downBound: THREE.Mesh
    private leftBound: THREE.Mesh
    private rightBound: THREE.Mesh

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

        this.upBound = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshBasicMaterial({ color: 0xff0000 }),
        )

        this.downBound = this.upBound.clone()
        this.leftBound = this.upBound.clone()
        this.rightBound = this.upBound.clone()

        this.scene.add(this.upBound)
        this.scene.add(this.downBound)
        this.scene.add(this.leftBound)
        this.scene.add(this.rightBound)

        this.previousCurrentLevel = undefined
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

        const currentLevel = this.rocket.entity.components.rocket!.currentLevel

        if (currentLevel !== this.previousCurrentLevel) {
            console.log("Current level changed: ", currentLevel)

            const tl = currentLevel.components.level.boundsTL
            const br = currentLevel.components.level.boundsBR

            this.upBound.position.set((tl.x + br.x) / 2, br.y + 87.25, 0)
            this.leftBound.position.set(tl.x - 50, (tl.y + br.y) / 2, 0)
            this.downBound.position.set((tl.x + br.x) / 2, tl.y - 87.25, 0)
            this.rightBound.position.set(br.x + 50, (tl.y + br.y) / 2, 0)

            this.previousCurrentLevel = currentLevel
        }
    }

    getScene() {
        return this.scene
    }
}
