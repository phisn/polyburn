import { RuntimeFactoryContext } from "runtime/src/core/runtime-factory-context"
import { Scene, WebGLRenderer } from "three"
import { GameHooks } from "../game-settings"
import { ExtendedComponents } from "./extended-components"

export interface ExtendedFactoryContext extends RuntimeFactoryContext<ExtendedComponents> {
    hooks?: GameHooks
    scene: Scene
    renderer: WebGLRenderer
}
