import { EntityWith, SystemStack } from "runtime-framework"
import { RuntimeComponents } from "runtime/src/core/runtime-components"
import { RuntimeFactoryContext } from "runtime/src/core/runtime-factory-context"
import { RuntimeSystemContext } from "runtime/src/core/runtime-system-stack"
import { Runtime } from "runtime/src/runtime"
import * as THREE from "three"
import { AgentColors, agentColorsGrayScale, agentColorsRGB } from "./colors"
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
        private grayScale: boolean,
    ) {
        const colors = grayScale ? agentColorsGrayScale : agentColorsRGB

        const [rocketEntity] = runtime.factoryContext.store.find("rocket", "rigidBody")
        this.rocket = new Rocket(rocketEntity, colors)
        this.scene.add(this.rocket)

        this.initShapes(runtime, colors)

        for (const levelEntity of runtime.factoryContext.store.find("level")) {
            if (levelEntity.components.level.hideFlag) {
                continue
            }

            const flag = new Flag(levelEntity, colors)
            scene.add(flag)
            this.flags.push(flag)
        }

        this.upBound = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshBasicMaterial({ color: colors.outOfBounds }),
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
        colors: AgentColors,
    ) {
        const shapes = runtime.factoryContext.store.newSet("shape")

        for (const shape of shapes) {
            const shapeGeometry = new MutatableShapeGeometry(
                shape.components.shape.vertices.map(vertex => ({
                    position: new THREE.Vector2(vertex.position.x, vertex.position.y),
                    color: colors.shape,
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
            const tl = currentLevel.components.level.boundsTL
            const br = currentLevel.components.level.boundsBR

            const center = new THREE.Vector2((tl.x + br.x) / 2, (tl.y + br.y) / 2)
            const width = Math.abs(br.x - tl.x)
            const height = Math.abs(br.y - tl.y)

            this.upBound.position.set(center.x, center.y + height / 2 + 50, 0)
            this.downBound.position.set(center.x, center.y - height / 2 - 50, 0)
            this.leftBound.position.set(center.x - width / 2 - 50, center.y, 0)
            this.rightBound.position.set(center.x + width / 2 + 50, center.y, 0)

            this.previousCurrentLevel = currentLevel
        }
    }

    getScene() {
        return this.scene
    }
}
