import { RuntimeFactoryContext } from "runtime/src/core/runtime-factory-context"
import { ReplayCaptureService } from "runtime/src/model/replay/replay-capture-service"
import { Scene, WebGLRenderer } from "three"
import { GameSettings } from "../game-settings"
import { ExtendedComponents } from "./extended-components"

export interface ExtendedFactoryContext extends RuntimeFactoryContext<ExtendedComponents> {
    replayCapture: ReplayCaptureService
    settings: GameSettings
    scene: Scene
    renderer: WebGLRenderer
}
