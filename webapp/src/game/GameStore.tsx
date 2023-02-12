import RAPIER from "@dimforge/rapier2d-compat"
import { create } from "zustand";
import { ObjectInWorld, Shape, World } from "../editor/World";

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

        world.shapes.forEach(shape => 
            createShapeBody(shape, rapierWorld)
        )

        const objectBodies = world.objects.map((object: ObjectInWorld) => ({
            object: object,
            body: createObjectBody(rapierWorld, object)
        }))

        set({
            rapierWorld,
            world,
            objectBodies
        })
    }
}))

function createObjectBody(rapierWorld: RAPIER.World, object: ObjectInWorld) {
    const body = rapierWorld.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(object.position.x, object.position.y)
            .setRotation(object.rotation)
    );

    const colliderDesc = RAPIER.ColliderDesc.ball(10);

    if (colliderDesc == null) {
        throw new Error("Failed to create collider");
    }

    const collider = rapierWorld.createCollider(
        colliderDesc,
        body
    );

    return body
}

function createShapeBody(shape: Shape, rapierWorld: RAPIER.World) {
    const [vertices, top, left] = verticesForShape(shape);

    const body = rapierWorld.createRigidBody(
        RAPIER.RigidBodyDesc.fixed()
            .setTranslation(left, top)
    );

    const colliderDesc = RAPIER.ColliderDesc.polyline(vertices);

    if (colliderDesc == null) {
        throw new Error("Failed to create collider");
    }

    const collider = rapierWorld.createCollider(
        colliderDesc,
        body
    );
}

function verticesForShape(shape: Shape): [ Float32Array, number, number ] {
    const left = shape.vertices.reduce((acc, vertex) => Math.min(acc, vertex.x), Infinity)
    const top  = shape.vertices.reduce((acc, vertex) => Math.min(acc, vertex.y), Infinity)

    const vertices = new Float32Array(shape.vertices.length * 2);

    shape.vertices.forEach((vertex, i) => {
        vertices[i * 2] = vertex.x - left;
        vertices[i * 2 + 1] = vertex.y - top;
    });

    vertices[vertices.length - 2] = shape.vertices[0].x - left;
    vertices[vertices.length - 1] = shape.vertices[0].y - top;

    return [ vertices, top, left ]
}

export default useGameStore
