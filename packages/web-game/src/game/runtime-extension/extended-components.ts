import { RuntimeComponents } from "runtime/src/core/runtime-components"

export interface ExtendedComponents extends RuntimeComponents {
    interpolation?: {
        position: { x: number; y: number }
        rotation: number
    }
}
