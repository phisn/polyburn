import { EntityWith } from "runtime-framework"
import { RuntimeComponents } from "runtime/src/core/runtime-components"
import { RuntimeSystemContext } from "runtime/src/core/runtime-system-stack"
import { Runtime } from "runtime/src/runtime"
import * as THREE from "three"
import { GameInterface } from "./game"
import { GameSettings } from "./game-settings"
import { ModuleInput } from "./modules/module-input/module-input"
import { ModuleSceneAgent } from "./modules/module-scene-agent/module-scene-agent"
import { ExtendedRuntime, newExtendedRuntime } from "./runtime-extension/new-extended-runtime"

export class GameAgentWrapper {
    sceneModule: ModuleSceneAgent
    camera: THREE.OrthographicCamera

    private rocket: EntityWith<RuntimeComponents, "rigidBody">

    constructor(
        private runtime: Runtime,
        scene: THREE.Scene,
    ) {
        scene.background = new THREE.Color(0)
        this.sceneModule = new ModuleSceneAgent(scene, runtime)

        this.camera = new THREE.OrthographicCamera(-16, 16, 16, -16, -1000, 1000)
        this.rocket = runtime.factoryContext.store.find("rocket", "rigidBody")[0]

        this.camera.position.set(
            this.rocket.components.rigidBody.translation().x,
            this.rocket.components.rigidBody.translation().y,
            10,
        )
    }

    step(context: RuntimeSystemContext) {
        this.runtime.step(context)

        this.sceneModule.onUpdate()

        this.camera.position.set(
            this.rocket.components.rigidBody.translation().x,
            this.rocket.components.rigidBody.translation().y,
            10,
        )
    }
}

export class GameAgentAsPlayer implements GameInterface {
    runtime: ExtendedRuntime
    input: ModuleInput
    gameWrapper: GameAgentWrapper

    constructor(settings: GameSettings) {
        settings.canvas.width = 64
        settings.canvas.height = 64

        const renderer = new THREE.WebGLRenderer({
            canvas: settings.canvas,
            antialias: false,
            alpha: true,
        })

        this.runtime = newExtendedRuntime(settings, new THREE.Scene(), renderer)

        renderer.setClearColor(THREE.Color.NAMES["black"], 1)

        this.gameWrapper = new GameAgentWrapper(this.runtime, this.runtime.factoryContext.scene)
        this.input = new ModuleInput(this.runtime)
    }

    dispose() {
        this.input.dispose()
    }

    onPreFixedUpdate(delta: number) {
        this.input.onPreFixedUpdate(delta)
    }

    onFixedUpdate() {
        const context = {
            thrust: this.input.thrust(),
            rotation: this.input.rotation(),
        }

        this.gameWrapper.step(context)

        this.runtime.factoryContext.renderer.render(
            this.runtime.factoryContext.scene,
            this.gameWrapper.camera,
        )
    }

    onUpdate() {}
}
