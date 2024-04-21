import { RuntimeFactoryContext } from "runtime/src/core/runtime-factory-context"
import { ReplayCaptureService } from "runtime/src/model/replay/replay-capture-service"
import { Scene, WebGLRenderer } from "three"
import { GameHooks } from "../game-settings"
import { ExtendedComponents } from "./extended-components"

export interface ExtendedFactoryContext extends RuntimeFactoryContext<ExtendedComponents> {
    worldname: string
    gamemode: string

    replayCapture: ReplayCaptureService

    hooks?: GameHooks
    scene: Scene
    renderer: WebGLRenderer
}
