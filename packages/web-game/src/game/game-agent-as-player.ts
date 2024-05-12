import { Buffer } from "buffer"
import { ReplayModel } from "runtime/proto/replay"
import * as THREE from "three"
import { GameInterface } from "./game"
import { GameAgentWrapper } from "./game-agent-wrapper"
import { GameSettings } from "./game-settings"
import { ModuleInput } from "./modules/module-input/module-input"
import { DefaultGameReward, Reward } from "./reward/default-reward"
import { ReplayFollowTracker, processReplayForAgent } from "./reward/replay-follow-tracker"
import { ExtendedRuntime, newExtendedRuntime } from "./runtime-extension/new-extended-runtime"

export class GameAgentAsPlayer implements GameInterface {
    runtime: ExtendedRuntime
    input: ModuleInput
    gameWrapper: GameAgentWrapper
    reward: Reward
    totalReward = 0

    constructor(settings: GameSettings) {
        settings.canvas.width = 96
        settings.canvas.height = 96
        settings.canvas.style.imageRendering = "pixelated"

        settings.canvas.style.width = `${12 * settings.canvas.width}px`
        settings.canvas.style.height = `${12 * settings.canvas.height}px`

        settings.gamemode = "Normal"

        const renderer = new THREE.WebGLRenderer({
            canvas: settings.canvas,
            antialias: false,
            alpha: true,
        })

        this.runtime = newExtendedRuntime(settings, new THREE.Scene(), renderer)

        renderer.setClearColor(THREE.Color.NAMES["black"], 1)

        const replayToFollow =
            "CuUmcggAAAAACGaizaTNpGaeZp5momemZqrNqACozaTNpGWeZp4AAAFmomeeZ54AAAVmnmaiZ54AAAFnngAAAWaeZ55mngAABGaeAAACZ54AAAdmIs0kMyuaKTMtZyozLZopzChnKgAozShlIgAAAmYeZx5mHgAAAWYeAAAFZp5momeiZqZnomaeZ6Jmos2kZp5momeiZqJmogAABGeeAAAFZh5mImciZiJnIs0kzCTNJGciZh4AAAFnHgAADM2kzaRmps2kzajMpGeiZp5nnmaeAAABZ54AAAFmngAAWWaiZ6YAqACoZZ5momeeZp5nomaeZqJnngAAAWaeZqJnomaiZ54AAAJmnmeiZp4AAAJmngAACmYeZx4AAANmHmceAAAMZ55mnmaiZ6JmomeiZp5mngAAAmaiZ6IAAAFmomeeZqJnomaiZ55mnmaiZ55nos2kzKRongAAGWaiZ6Jmps2kzagAqGamZ55mngAACGYeAAABZiJnHmceZh5nHgAAAWYeZh5nHmYeAAABZx5mHs0kZh5mImciZh7NJGYiZibNJM0kzSQAKGYmZiZnJs0kZibNJGYiZibNJGcmzCQAKGcmZiaaKWYmACjNJGYiZh4AAAJmHmceZh5mIgAAAWcezSTNKMwkAChnImYiZx5nHgAABmYeAAABZh5nHmYeAAABZx4AADJnnmaeZqJnnmeeAAAHZp5nngAAAWaeZp5nnmaiZ6IAAAJmngAAC2aeZqJnns2kZp5momeeZ55momeiAAAOZp5momeeZqIAAAFnngAAAmaeAAABZ54AAAFmnmaiZ6ZmomaiZ55mos2kzaRmomaezaRmngAAAWaeAAAXZh4AAAdnHgAAAmYeZx4AAAFmHgAAAWYeAABTzaTMpGieZ6JmomaizaTNqM2oZqrNqGaszajNqDOrAKjNqGemZqbNpACozaTNpACoZqbNpGaiAAABZp4AAApmHgAABmYeAAACZx5mHmceZh5mHmciZh5mHmYiZyJmImceZh4AAAFnHmYeZh5nHmYeAAABZx5mHmYezSRmHmYiZyJmImcizSRlHmYiZx5mImciZh5mHmciZiJmImcmZiJmJmceZiJnHmYmZyZmJjMrzSgzK2cmzShmImYeZh4AABJmomeeZqJnnmaeZ6JmnmaeZp4AAAJnnmaeAAABZ55mngAAAmaeZ55mngAA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"

        this.gameWrapper = new GameAgentWrapper(
            this.runtime,
            this.runtime.factoryContext.scene,
            false,
            96 / 4,

            new ReplayFollowTracker(
                this.runtime,
                processReplayForAgent(
                    ReplayModel.decode(Buffer.from(replayToFollow, "base64")),
                    this.runtime,
                ),
            ),
        )

        this.input = new ModuleInput(this.runtime)
        this.reward = new DefaultGameReward(
            this.runtime,
            new ReplayFollowTracker(
                this.runtime,
                processReplayForAgent(
                    ReplayModel.decode(Buffer.from(replayToFollow, "base64")),
                    this.runtime,
                ),
            ),
        )
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

        this.totalReward += reward

        console.log("Reward:", reward, "Done:", done, "Total Reward:", this.totalReward)

        this.runtime.factoryContext.renderer.render(
            this.runtime.factoryContext.scene,
            this.gameWrapper.camera,
        )
    }

    onUpdate() {}
}
