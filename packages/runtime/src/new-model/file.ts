interface RocketConfig {
    thrustDistance: number
    thrustValue: number
    thrustGroundMultiplier: number
    explosionAngle: number
}

interface RocketEntity {
    type: "rocket"
    position: { x: number; y: number }
    rotation: number

    defaultConfig: RocketConfig
}

interface LevelEntity {
    type: "level"
    position: { x: number; y: number }
    rotation: number

    cameraTopLeft: { x: number; y: number }
    cameraBottomRight: { x: number; y: number }

    captureAreaLeft: number
    captureAreaRight: number

    rocketConfig?: RocketConfig
}

interface ShapeVertex {
    x: number
    y: number
    color: number
}

interface ShapeEntity {
    type: "shape"
    vertices: ShapeVertex[]
}

type Entity = RocketEntity | LevelEntity | ShapeEntity

interface FileHead {
    gamemodes: string[]
    entityCount: number
}

export interface File {
    head: FileHead

    // saved as { "list of gamemodes" -> "allow" and "deny" -> list of entities }. after reading
    // demap the entities into a list of entities per gamemode. entities are stored as references
    entities: { [gamemode: string]: Entity[] }
}

export {}
