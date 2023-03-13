import RAPIER from "@dimforge/rapier2d-compat"
import * as THREE from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader"

import { entities } from "../../model/world/Entities"
import { Entity } from "../../model/world/Entity"
import { Point } from "../../model/world/Point"
import { scale } from "../../model/world/Size"
import { changeAnchor } from "../../utility/math"
import { RuntimeEntity } from "./RuntimeEntity"
import { UpdateContext } from "./UpdateContext"

export enum RocketStateType {
    Alive = "Alive",
}

export interface RocketAliveState {
    type: RocketStateType.Alive
    position: Point
    rotation: number
}

export type RocketState = RocketAliveState

export interface SvgShape {
    shape: THREE.Shape
    color: string
    opacity: number
}

export async function shapesFromSvg(url: string): Promise<SvgShape[]> {
    const svg = await new SVGLoader().loadAsync(url)

    return svg.paths
        .filter(path => path.userData?.style.fill !== undefined &&
                        path.userData?.style.fill !== "none")
        .flatMap(path => 
            SVGLoader.createShapes(path).map(shape => ({
                shape,
                color: path.userData?.style.fill,
                opacity: path.userData?.style.fillOpacity
            }))
        )
}

export function trimeshColliderFromShapes(shapes: THREE.Shape[]): RAPIER.ColliderDesc {
    const geometry = new THREE.ShapeGeometry(shapes)

    if (!(geometry.attributes.position instanceof THREE.BufferAttribute)) {
        throw new Error("No position attribute found in geometry")
    }

    if (geometry.index === null) {
        throw new Error("No index found in geometry")
    }

    const points3d = new Float32Array(geometry.attributes.position.array)
    const points = new Float32Array(points3d.length / 3 * 2)

    for (let i = 0; i < points3d.length; i += 3) {
        points[i / 3 * 2] = points3d[i]
        points[i / 3 * 2 + 1] = points3d[i + 1]
    }

    const indices3d = new Uint32Array(geometry.index.array)
    const indices = new Uint32Array(indices3d.length / 3 * 4)

    for (let i = 0; i < indices3d.length; i += 3) {
        indices[i / 3 * 4] = indices3d[i]
        indices[i / 3 * 4 + 1] = indices3d[i + 1]
        indices[i / 3 * 4 + 2] = indices3d[i + 2]
        indices[i / 3 * 4 + 3] = indices3d[i]
    }
    
    return RAPIER.ColliderDesc.trimesh(
        points,
        new Uint32Array(geometry.index.array)
    )
}

export async function createRocket(scene: THREE.Scene, rapier: RAPIER.World, rocket: Entity): Promise<RuntimeEntity> {
    const entry = entities[rocket.type]

    const shapes = await shapesFromSvg(entry.src)

    const positionAtCenter = changeAnchor(
        rocket.position,
        rocket.rotation,
        scale(entry.size, entry.scale),
        entry.anchor,
        { x: 0.5, y: 0.5 }
    )

    const body = rapier.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(positionAtCenter.x, positionAtCenter.y)
            .setRotation(rocket.rotation)
            .setCcdEnabled(true)
            .setAngularDamping(0.05)
    )

    const colliderDesc = trimeshColliderFromShapes(
        shapes.map(shape => shape.shape)
    )

    colliderDesc.setMass(4)
    colliderDesc.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)

    if (colliderDesc == null) {
        throw new Error("Failed to create collider")
    }

    rapier.createCollider(
        colliderDesc,
        body
    )

    const root = new THREE.Object3D()

    root.position.set(positionAtCenter.x, positionAtCenter.y, 0)
    root.rotation.set(0, 0, rocket.rotation)

    shapes.forEach(shape => {
        const material = new THREE.MeshBasicMaterial({ 
            color: shape.color,
            opacity: shape.opacity
        })

        const mesh = new THREE.Mesh(
            new THREE.ShapeGeometry(shape.shape),
            material
        )

        root.add(mesh)
    })

    scene.add(root)

    return {
        entity: rocket,

        update: function(context: UpdateContext) {
            void 0
        },

        updateGraphics: function() {
            root.position.set(body.translation().x, body.translation().y, 0)
        }
    }
}
