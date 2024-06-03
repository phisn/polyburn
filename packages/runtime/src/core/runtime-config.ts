export interface RuntimeConfig {
    thrustDistance: number
    thrustValue: number
    thrustGroundMultiplier: number
    explosionAngle: number
}

export const defaultConfig: RuntimeConfig = {
    thrustDistance: 1,
    thrustValue: 7.3,
    thrustGroundMultiplier: 1.3,
    explosionAngle: 0.3,
}

export const hardConfig: RuntimeConfig = {
    thrustDistance: 1.0,
    thrustValue: 6.5, // 7.3,
    thrustGroundMultiplier: 1.3,
    explosionAngle: 1,
}
