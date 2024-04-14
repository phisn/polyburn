import { EntityWith, SystemStack } from "runtime-framework"
import { RocketEntityComponents } from "runtime/src/core/rocket/rocket-entity"
import { RuntimeFactoryContext } from "runtime/src/core/runtime-factory-context"
import { RuntimeSystemContext } from "runtime/src/core/runtime-system-stack"
import * as THREE from "three"
import { ExtendedComponents } from "../runtime-extension/components"
import { ExtendedRuntime } from "../runtime-extension/new-extended-runtime"
import { MutatableShapeGeometry } from "./mutatable-shape-geometry"
import { Flag } from "./objects/flag"
import { Rocket } from "./objects/rocket"

export class GameScene extends THREE.Scene {
    private entitiesInterpolated: EntityInterpolation[] = []
    private flags: Flag[] = []

    constructor(private runtime: ExtendedRuntime) {
        super()

        this.initRocket(runtime)
        this.initShapes(runtime)

        for (const levelEntity of runtime.factoryContext.store.find("level")) {
            if (levelEntity.components.level.hideFlag) {
                continue
            }

            const flag = new Flag(levelEntity)
            this.add(flag)
            this.flags.push(flag)
        }
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

            this.add(shapeMesh)
        }
    }

    private initRocket(
        runtime: SystemStack<RuntimeFactoryContext<ExtendedComponents>, RuntimeSystemContext>,
    ) {
        const [rocketEntity] = runtime.factoryContext.store.newSet(...RocketEntityComponents)
        const rocket = new Rocket()

        this.entitiesInterpolated.push(
            new EntityInterpolation(
                rocketEntity.with({
                    interpolation: {
                        position: { x: 0, y: 0 },
                        rotation: 0,
                    },
                }),
                rocket,
            ),
        )

        this.add(rocket)
    }

    onUpdate(delta: number, overstep: number) {
        for (const entityInterpolation of this.entitiesInterpolated) {
            entityInterpolation.onUpdate(delta, overstep)
        }

        for (const flag of this.flags) {
            flag.onUpdate()
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
