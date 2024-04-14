import { RuntimeFactoryContext } from "runtime/src/core/runtime-factory-context"
import { Scene, WebGLRenderer } from "three"
import { ExtendedComponents } from "./extended-components"

export interface ExtendedFactoryContext extends RuntimeFactoryContext<ExtendedComponents> {
    scene: Scene
    renderer: WebGLRenderer
}
