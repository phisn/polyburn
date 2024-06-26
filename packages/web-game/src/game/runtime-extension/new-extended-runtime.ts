import RAPIER from "@dimforge/rapier2d"
import { SystemStack } from "runtime-framework"
import { RuntimeSystemContext } from "runtime/src/core/runtime-system-stack"
import { ReplayCaptureService } from "runtime/src/model/replay/replay-capture-service"
import { newRuntime } from "runtime/src/runtime"
import { Scene, WebGLRenderer } from "three"
import { GameSettings } from "../game-settings"
import { ExtendedFactoryContext } from "./extended-factory-context"

export function newExtendedRuntime(settings: GameSettings, scene: Scene, renderer: WebGLRenderer) {
    const runtime: SystemStack<ExtendedFactoryContext, RuntimeSystemContext> = newRuntime(
        RAPIER,
        settings.world,
        settings.gamemode,
    ).extend({
        settings,
        replayCapture: new ReplayCaptureService(),
        scene,
        renderer,
    })

    for (const rocket of runtime.factoryContext.store.find("rocket", "rigidBody")) {
        rocket.components.interpolation = {
            position: rocket.components.rigidBody.translation(),
            rotation: rocket.components.rigidBody.rotation(),
        }
    }

    return runtime
}

export type ExtendedRuntime = ReturnType<typeof newExtendedRuntime>
