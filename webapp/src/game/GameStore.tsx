import RAPIER from "@dimforge/rapier2d"
import { create } from "zustand";
import { ObjectInWorld, World } from "../editor/World";

export interface GameState {
    rapierWorld: RAPIER.World | null
    world: World | null
    objectBodies: { object: ObjectInWorld, body: RAPIER.RigidBody }[]
}

export interface GameStore extends GameState {
    prepare: (world: World) => void
}

export const initialGameState: GameState = {
    rapierWorld: null,
    world: null,
    objectBodies: []
}

const useGameStore = create<GameStore>((set, get) => ({
    ...initialGameState,
    prepare: (world: World) => {
        const rapierWorld = new RAPIER.World(
            { x: 0.0, y: -9.81 }
        )

        world.shapes.forEach(shape => {
            const body = rapierWorld.createRigidBody(
                RAPIER.RigidBodyDesc.dynamic()
            )

            const vertices = new Float32Array(shape.vertices.length * 2)

            shape.vertices.forEach((vertex, i) => {
                vertices[i * 2] = vertex.x
                vertices[i * 2 + 1] = vertex.y
            })

            const colliderDesc = RAPIER.ColliderDesc.convexHull(vertices)

            if (colliderDesc == null) {
                throw new Error("Failed to create collider")
            }

            const collider = rapierWorld.createCollider(
                colliderDesc,
                body
            )
        })

        const objectBodies = world.objects.map((object: ObjectInWorld) => {
            const body = rapierWorld.createRigidBody(
                RAPIER.RigidBodyDesc.dynamic()
            )

            const colliderDesc = RAPIER.ColliderDesc.cuboid(
                object.placeable.size.width / 2,
                object.placeable.size.height / 2
            )

            if (colliderDesc == null) {
                throw new Error("Failed to create collider")
            }

            const collider = rapierWorld.createCollider(
                colliderDesc,
                body
            )

            body.setTranslation({ x: object.position.x, y: object.position.y }, true)
            body.setRotation(object.rotation, true)

            return {  object, body }
        })

        set({
            rapierWorld,
            world,
            objectBodies
        })
    }
}))

export default useGameStore
