import { EntityWith, MessageCollector, SystemStack } from "runtime-framework"
import { RocketDeathMessage } from "runtime/src/core/rocket/rocket-death-message"
import { RocketEntityComponents } from "runtime/src/core/rocket/rocket-entity"
import { RuntimeFactoryContext } from "runtime/src/core/runtime-factory-context"
import { RuntimeSystemContext } from "runtime/src/core/runtime-system-stack"
import * as THREE from "three"
import { ExtendedComponents } from "../../runtime-extension/extended-components"
import { ExtendedRuntime } from "../../runtime-extension/new-extended-runtime"
import { MutatableShapeGeometry } from "./mutatable-shape-geometry"
import { Flag } from "./objects/flag"
import { Rocket } from "./objects/rocket"

export class ModuleScene {
    private entitiesInterpolated: EntityInterpolation[] = []
    private flags: Flag[] = []

    private rocketInterplation!: EntityInterpolation
    private rocketDeathCollector: MessageCollector<RocketDeathMessage>

    constructor(private runtime: ExtendedRuntime) {
        this.initRocket(runtime)
        this.initShapes(runtime)

        for (const levelEntity of runtime.factoryContext.store.find("level")) {
            if (levelEntity.components.level.hideFlag) {
                continue
            }

            const flag = new Flag(levelEntity)
            this.runtime.factoryContext.scene.add(flag)
            this.flags.push(flag)
        }

        this.rocketDeathCollector = runtime.factoryContext.messageStore.collect("rocketDeath")
    }

    private initShapes(
        runtime: SystemStack<RuntimeFactoryContext<ExtendedComponents>, RuntimeSystemContext>,
    ) {
        const shapes = runtime.factoryContext.store.newSet("shape")

        for (const shape of shapes) {
            const shapeGeometry = new MutatableShapeGeometry(
                shape.components.shape.vertices.map(vertex => ({
                    position: new THREE.Vector2(vertex.position.x, vertex.position.y),
                    color: vertex.color,
                })),
            )
            const shapeMaterial = new THREE.MeshBasicMaterial({ vertexColors: true })
            const shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial)

            this.runtime.factoryContext.scene.add(shapeMesh)
        }
    }

    private initRocket(
        runtime: SystemStack<RuntimeFactoryContext<ExtendedComponents>, RuntimeSystemContext>,
    ) {
        const [rocketEntity] = runtime.factoryContext.store.newSet(
            ...RocketEntityComponents,
            "interpolation",
        )

        const rocket = new Rocket()
        const rocketInterpolation = new EntityInterpolation(rocketEntity, rocket)

        this.entitiesInterpolated.push(rocketInterpolation)
        this.runtime.factoryContext.scene.add(rocket)

        this.rocketInterplation = rocketInterpolation
    }

    onUpdate(delta: number, overstep: number) {
        for (const entityInterpolation of this.entitiesInterpolated) {
            entityInterpolation.onUpdate(delta, overstep)
        }

        for (const flag of this.flags) {
            flag.onUpdate()
        }

        if ([...this.rocketDeathCollector].length > 0) {
            this.rocketInterplation.reset()
            console.log("Rocket died ..")
        }
    }

    onFixedUpdate(last: boolean) {
        if (last) {
            for (const entityInterpolation of this.entitiesInterpolated) {
                entityInterpolation.onLastFixedUpdate()
            }
        }
    }
}

class EntityInterpolation {
    private previousX: number
    private previousY: number
    private previousRotation: number

    constructor(
        private entity: EntityWith<ExtendedComponents, "rigidBody" | "interpolation">,
        private object: THREE.Object3D,
    ) {
        const translation = entity.components.rigidBody.translation()
        this.previousX = translation.x
        this.previousY = translation.y
        this.previousRotation = entity.components.rigidBody.rotation()
    }

    onUpdate(delta: number, overstep: number) {
        const translation = this.entity.components.rigidBody.translation()
        const rotation = this.entity.components.rigidBody.rotation()

        this.object.position.x = this.lerp(this.previousX, translation.x, overstep)
        this.object.position.y = this.lerp(this.previousY, translation.y, overstep)
        this.object.rotation.z = this.slerp(this.previousRotation, rotation, overstep)

        this.entity.components.interpolation.position.x = this.object.position.x
        this.entity.components.interpolation.position.y = this.object.position.y
        this.entity.components.interpolation.rotation = this.object.rotation.z
    }

    onLastFixedUpdate() {
        const translation = this.entity.components.rigidBody.translation()
        const rotation = this.entity.components.rigidBody.rotation()

        this.previousX = translation.x
        this.previousY = translation.y
        this.previousRotation = rotation
    }

    position() {
        return this.object.position
    }

    reset() {
        const translation = this.entity.components.rigidBody.translation()
        const rotation = this.entity.components.rigidBody.rotation()

        this.object.position.x = translation.x
        this.object.position.y = translation.y
        this.object.rotation.z = rotation

        this.entity.components.interpolation.position.x = this.object.position.x
        this.entity.components.interpolation.position.y = this.object.position.y
        this.entity.components.interpolation.rotation = this.object.rotation.z

        this.previousX = translation.x
        this.previousY = translation.y
        this.previousRotation = rotation
    }

    private lerp(previous: number, next: number, t: number) {
        return (1 - t) * previous + t * next
    }

    private slerp(previous: number, next: number, t: number) {
        const difference = next - previous
        const shortestAngle =
            (((difference % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI

        return previous + shortestAngle * t
    }
}
