import RAPIER from "@dimforge/rapier2d-compat"
import { create } from "zustand";
import { ObjectInWorld, World } from "../editor/World";

RAPIER.init()

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
            { x: 0.0, y: 9.81 }
        )

        world.shapes.forEach(shape => {
            const left = shape.vertices.reduce((acc, vertex) => Math.min(acc, vertex.x), Infinity)
            const top  = shape.vertices.reduce((acc, vertex) => Math.min(acc, vertex.y), Infinity)

            const body = rapierWorld.createRigidBody(
                RAPIER.RigidBodyDesc.fixed()
                    .setTranslation(left, top)
            )

            const vertices = new Float32Array(shape.vertices.length * 2)

            shape.vertices.forEach((vertex, i) => {
                vertices[i * 2] = vertex.x - left
                vertices[i * 2 + 1] = vertex.y - top
            })

            vertices[vertices.length - 2] = shape.vertices[0].x - left
            vertices[vertices.length - 1] = shape.vertices[0].y - top

            const colliderDesc = RAPIER.ColliderDesc.polyline(vertices)

            if (colliderDesc == null) {
                throw new Error("Failed to create collider")
            }

            const collider = rapierWorld.createCollider(
                colliderDesc,
                body
            )
        })

        const objectBodies = world.objects.map((object: ObjectInWorld) => {
            console.log(`Creating object ${object}`)
            
            const body = rapierWorld.createRigidBody(
                RAPIER.RigidBodyDesc.dynamic()
                    .setTranslation(object.position.x, object.position.y)
                    .setRotation(object.rotation)
            )

            const colliderDesc = RAPIER.ColliderDesc.ball(10)

            if (colliderDesc == null) {
                throw new Error("Failed to create collider")
            }

            const collider = rapierWorld.createCollider(
                colliderDesc,
                body
            )

            return { object, body }
        })

        set({
            rapierWorld,
            world,
            objectBodies
        })
    }
}))

export default useGameStore
