export {}
/*
import RAPIER, { ColliderDesc, RayColliderToi } from "@dimforge/rapier2d-compat"
import { create } from "zustand"
import { ObjectInWorld, Shape, World } from "../editor/legacy/World"
import { changeAnchor } from "../utility/math"

RAPIER.init()

export class GameState {
    constructor(
        public rapierWorld: RAPIER.World,
        public world: World,
    
        public rocket: RAPIER.RigidBody,
        public rocketObject: ObjectInWorld
    ) {}

    rocketGroundRayRaw() {
        let rayStart = changeAnchor(
            this.rocket.translation(),
            this.rocket.rotation(),
            {
                width: this.rocketObject.placeable.size.width * this.rocketObject.placeable.scale,
                height: this.rocketObject.placeable.size.height * this.rocketObject.placeable.scale
            },
            { x: 0.5, y: 0.5 },
            { x: 0.5, y: 0.8 }
        )

        let rayTarget = changeAnchor(
            this.rocket.translation(),
            this.rocket.rotation(),
            {
                width: this.rocketObject.placeable.size.width * this.rocketObject.placeable.scale,
                height: this.rocketObject.placeable.size.height * this.rocketObject.placeable.scale
            },
            { x: 0.5, y: 0.5 },
            { x: 0.5, y: 2 }
        )

        let rayDir = new RAPIER.Vector2(
            rayTarget.x - rayStart.x,
            rayTarget.y - rayStart.y
        )

        let length = Math.sqrt(rayDir.x * rayDir.x + rayDir.y * rayDir.y)
        let ray = new RAPIER.Ray(rayStart, rayDir)

        const cast: RayColliderToi | null = this.rapierWorld.castRay(
            ray,
            1,
            false,
            undefined,
            undefined,
            undefined,
            this.rocket
        )

        return {
            cast,
            ray,
            rayStart,
            rayTarget
        }
    }
    
    rocketGroundRay() {
        return this.rocketGroundRayRaw()?.cast
    }
}

interface RayResult {
    cast: RayColliderToi,
    rayStart: RAPIER.Vector2,
    rayTarget: RAPIER.Vector2,
}

export interface GameStore {
    state: GameState | null
    prepare: (world: World) => void
}

const useGameStore = create<GameStore>((set, get) => ({
    state: null,
    prepare: (world: World) => {
        console.log(`Preparing game world: '${JSON.stringify(world)}'`)

        const rapierWorld = new RAPIER.World(
            { x: 0.0, y: 9.81 * 4 }
        )

        world.shapes.forEach(shape => 
            createShapeBody(shape, rapierWorld)
        )

        const [ rocket, rocketObject ] = createRocket(rapierWorld, world)

        const state = new GameState(
            rapierWorld,
            world,
            rocket,
            rocketObject
        )

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

    // given rocket.position rocket.rotation rocket.placeable.size rocket.placeable.scale rocket.placeable.anchor
    // find position of center of rocket
    const positionAtCenter = changeAnchor(
        rocket.position,
        rocket.rotation,
        { 
            width: rocket.placeable.size.width  * rocket.placeable.scale,
            height: rocket.placeable.size.height * rocket.placeable.scale
        },
        rocket.placeable.anchor,
        { x: 0.5, y: 0.5 }
    )

    console.log(`rotation: ${rocket.rotation}`)

    const body = rapierWorld.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(positionAtCenter.x, positionAtCenter.y)
            .setRotation(rocket.rotation)
            .setCcdEnabled(true)
            .setAngularDamping(0.05)
    )

    // Points directly taken from svg
    const points = new Float32Array([
          0, 600,   3, 355,   4, 344,   7, 310,  15, 256,  43, 169,
         87,  85, 150,   0, 183,  42, 200,  62, 243, 138, 277, 229,
        291, 297, 296, 334, 300, 600, 300, 600, 190, 502, 110, 502
    ])

    // Move all points by 50% up and 50% left
    for (let i = 0; i < points.length; i += 2) {
        points[i] -= 150
        points[i + 1] -= 300
    }

    // Svg is will be scaled before draw, therefore we need to scale the points
    for (let i = 0; i < points.length; i++) {
        points[i] *= rocket.placeable.scale;
    }

    const colliderDesc = RAPIER.ColliderDesc.convexHull(points)
        ?.setMass(4)
        ?.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)

    if (colliderDesc == null) {
        throw new Error("Failed to create collider")
    }

    const collider = rapierWorld.createCollider(
        colliderDesc,
        body
    )

    return [ body, rocket ]
}

function createShapeBody(shape: Shape, rapierWorld: RAPIER.World) {
    const [vertices, top, left] = verticesForShape(shape);

    const body = rapierWorld.createRigidBody(
        RAPIER.RigidBodyDesc.fixed()
            .setTranslation(left, top)
    )

    const colliderDesc = RAPIER.ColliderDesc.polyline(vertices);

    if (colliderDesc == null) {
        throw new Error("Failed to create collider");
    }

    const collider = rapierWorld.createCollider(
        colliderDesc,
        body
    )
}

function verticesForShape(shape: Shape): [ Float32Array, number, number ] {
    const left = shape.vertices.reduce((acc, vertex) => Math.min(acc, vertex.x), Infinity)
    const top  = shape.vertices.reduce((acc, vertex) => Math.min(acc, vertex.y), Infinity)

    const vertices = new Float32Array(shape.vertices.length * 2 + 2);

    shape.vertices.forEach((vertex, i) => {
        vertices[i * 2] = vertex.x - left;
        vertices[i * 2 + 1] = vertex.y - top;
    });

    vertices[vertices.length - 2] = shape.vertices[0].x - left;
    vertices[vertices.length - 1] = shape.vertices[0].y - top;

    return [ vertices, top, left ]
}

export default useGameStore
*/