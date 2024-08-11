import RAPIER from "@dimforge/rapier2d"
import { ModuleStore } from "runtime-framework/src/module"
import { Point } from "../../../model/point"
import { Rect } from "../../../model/rect"
import { captureBox } from "../../../model/world/level-model"
import { RuntimeBehaviors } from "../../behaviors"

export interface ModuleLevelConfig {
    position: Point
    rotation: number

    captureDistanceLeft: number
    captureDistanceRight: number

    cameraRect: Rect
}

export interface EntityLevel {
    current: boolean

    captured: boolean
    captureingTicksLeft?: number

    camera: Rect

    flag?: {
        position: Point
        rotation: number
    }
}

export function moduleLevel(store: ModuleStore<RuntimeBehaviors>, config: ModuleLevelConfig) {
    const rapier = store.single("runtimeDependencies")().runtimeDependencies.rapier
    const world = store.single("world")().world
    const getRocket = () => store.single("rocket")().rocket

    const rigidbody = world.rapierWorld.createRigidBody(
        new rapier.RigidBodyDesc(rapier.RigidBodyType.Fixed),
    )

    const cameraCollider = world.rapierWorld.createCollider(
        colliderDescriptionFromRect(rapier, config.cameraRect),
        rigidbody,
    )

    cameraCollider.setEnabled(false)

    const { size, transformed } = captureBox(
        config.position,
        config.rotation,
        config.captureDistanceLeft,
        config.captureDistanceRight,
    )

    const captureCollider = world.rapierWorld.createCollider(
        rapier.ColliderDesc.cuboid(size.width, size.height)
            .setTranslation(transformed.x, transformed.y)
            .setRotation(config.rotation)
            .setSensor(true),
        rigidbody,
    )

    const entity: EntityLevel = {
        current: false,
        captured: false,

        camera: config.cameraRect,

        flag: {
            position: { x: config.position.x, y: config.position.y },
            rotation: config.rotation,
        },
    }

    return store.register(
        {
            onRuntimeTick() {
                processCapturing()
            },
            collidable: {
                rigidbodyId: rigidbody.handle,
                onCollision({ other }) {
                    if (other?.rocket) {
                        const deathListeners = store.multiple("onRocketDeath")

                        for (const listener of deathListeners) {
                            listener.onRocketDeath({
                                position: other.rocket.rigidbody.translation(),
                                rotation: other.rocket.rigidbody.rotation(),
                            })
                        }
                    }
                },
            },
            onLevelCaptured({ level }) {
                if (level === entity) {
                    cameraCollider.setEnabled(true)
                    captureCollider.setEnabled(false)

                    entity.current = true
                    entity.captured = true
                    entity.captureingTicksLeft = undefined
                } else if (entity.current) {
                    cameraCollider.setEnabled(false)
                }
            },
        },
        function onDispose() {},
    )

    function processCapturing() {
        if (entity.captureingTicksLeft) {
            if (entity.captureingTicksLeft <= 0) {
                const velocity = getRocket().rigidbody.linvel()

                if (Math.abs(velocity.x) > 0.001 || Math.abs(velocity.y) > 0.001) {
                    return
                }

                const listeners = store.multiple("onLevelCaptured")

                for (const listener of listeners) {
                    listener.onLevelCaptured({
                        level: entity,
                    })
                }
            } else {
                entity.captureingTicksLeft--
            }
        }
    }
}

function colliderDescriptionFromRect(rapier: typeof RAPIER, rect: Rect) {
    return rapier.ColliderDesc.polyline(
        new Float32Array([
            rect.left,
            rect.top,

            rect.left,
            rect.bottom,

            rect.right,
            rect.bottom,

            rect.right,
            rect.top,

            rect.left,
            rect.top,
        ]),
    )
}
