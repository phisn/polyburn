import RAPIER, { ColliderDesc } from "@dimforge/rapier2d-compat"
import { create } from "zustand";
import { ObjectInWorld, Shape, World } from "../editor/World";

RAPIER.init()

export interface GameState {
    rapierWorld: RAPIER.World
    world: World

    rocket: RAPIER.RigidBody
    rocketObject: ObjectInWorld
}

export interface GameStore {
    state: GameState | null
    prepare: (world: World) => void
}

const useGameStore = create<GameStore>((set, get) => ({
    state: null,
    prepare: (world: World) => {
        const rapierWorld = new RAPIER.World(
            { x: 0.0, y: 9.81 }
        )

        world.shapes.forEach(shape => 
            createShapeBody(shape, rapierWorld)
        )

        const [ rocket, rocketObject ] = createRocket(rapierWorld, world)

        const state = {
            rapierWorld,
            world,
            rocket,
            rocketObject
        }

        set({ state })
    }
}))

function createRocket(rapierWorld: RAPIER.World, world: World): [ RAPIER.RigidBody, ObjectInWorld ] {
    const rockets = world.objects.filter(object => object.placeable.type === "Rocket")

    if (rockets.length === 0) {
        throw new Error("No rocket found")
    }

    if (rockets.length > 1) {
        throw new Error("Multiple rockets found")
    }

    const rocket = rockets[0]

    // upper left corner of rocket from rocket.position, rocket.placaable.anchor, rocket.placeable.scale and rocket.rotation
    const positionAtCenter = {
        x: rocket.position.x - rocket.placeable.size.width * rocket.placeable.anchor.x * rocket.placeable.scale * Math.cos(rocket.rotation) + rocket.placeable.size.height * rocket.placeable.anchor.y * rocket.placeable.scale * Math.sin(rocket.rotation),
        y: rocket.position.y - rocket.placeable.size.width * rocket.placeable.anchor.x * rocket.placeable.scale * Math.sin(rocket.rotation) - rocket.placeable.size.height * rocket.placeable.anchor.y * rocket.placeable.scale * Math.cos(rocket.rotation)
    }

    console.log(`rotation: ${rocket.rotation}`)

    const body = rapierWorld.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(positionAtCenter.x, positionAtCenter.y)
            .setRotation(rocket.rotation)
    )

    // Points directly taken from svg
    const points = new Float32Array([
          0, 600,   3, 355,   4, 344,   7, 310,  15, 256,  43, 169,
         87,  85, 150,   0, 183,  42, 200,  62, 243, 138, 277, 229,
        291, 297, 296, 334, 300, 600, 300, 600, 190, 502, 110, 502
    ])

    // Svg is will be scaled before draw, therefore we need to scale the points
    for (let i = 0; i < points.length; i++) {
        points[i] *= rocket.placeable.scale;
    }

    const colliderDesc = RAPIER.ColliderDesc.convexHull(points)

    if (colliderDesc == null) {
        throw new Error("Failed to create collider")
    }

    const collider = rapierWorld.createCollider(
        colliderDesc,
        body
    )

    return [ body, rocket ]
}

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
