import * as THREE from "three"
import { GameInterface } from "./game"
import { GameAgentWrapper } from "./game-agent-wrapper"
import { GameSettings } from "./game-settings"
import { ModuleInput } from "./modules/module-input/module-input"
import { DefaultGameReward, Reward } from "./reward/default-reward"
import { ExtendedRuntime, newExtendedRuntime } from "./runtime-extension/new-extended-runtime"

export class GameAgentAsPlayer implements GameInterface {
    runtime: ExtendedRuntime
    input: ModuleInput
    gameWrapper: GameAgentWrapper
    reward: Reward

    constructor(settings: GameSettings) {
        settings.canvas.width = 64
        settings.canvas.height = 64
        settings.gamemode = "Normal"

        const renderer = new THREE.WebGLRenderer({
            canvas: settings.canvas,
            antialias: false,
            alpha: true,
        })

        this.runtime = newExtendedRuntime(settings, new THREE.Scene(), renderer)

        renderer.setClearColor(THREE.Color.NAMES["black"], 1)

        this.gameWrapper = new GameAgentWrapper(this.runtime, this.runtime.factoryContext.scene)
        this.input = new ModuleInput(this.runtime)

        this.reward = new DefaultGameReward(this.runtime)
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

        const [reward, done] = this.reward.next(() => {
            this.gameWrapper.step(context)
        })

        console.log("Reward:", reward, "Done:", done)

        this.runtime.factoryContext.renderer.render(
            this.runtime.factoryContext.scene,
            this.gameWrapper.camera,
        )
    }

    onUpdate() {}
}
