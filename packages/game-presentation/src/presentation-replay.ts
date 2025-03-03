import { Game } from "game/src/game"
import { GameOutputReplay } from "game/src/model/api"
import { levelComponents, LevelEntity } from "game/src/modules/module-level"
import { rocketComponents, RocketEntity } from "game/src/modules/module-rocket"
import { GameConfig } from "game/src/store"
import { Color, WebGLRenderer } from "three"
import { ModuleCamera } from "./modules/module-camera"
import { ModuleInterpolation } from "./modules/module-interpolation"
import { ModuleParticles } from "./modules/module-particles/module-particles"
import { ModuleUI } from "./modules/module-ui/module-ui"
import { ModuleVisual } from "./modules/module-visual/module-visual"
import { PresentationRunnable } from "./presentation-game-loop"
import { PresentationStore } from "./store"

export interface PresentationReplayConfig extends GameConfig {
    replay: GameOutputReplay
}

export class PresentationReplay implements PresentationRunnable {
    public store: PresentationStore

    private moduleCamera: ModuleCamera
    private moduleInterpolation: ModuleInterpolation
    private moduleParticles: ModuleParticles
    private moduleUI: ModuleUI
    private moduleVisual: ModuleVisual

    private game: Game

    private indexToLevel: Map<number, LevelEntity>
    private getRocket: () => RocketEntity

    constructor(private config: PresentationReplayConfig) {
        const renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        })
        renderer.autoClear = false
        renderer.setClearColor(Color.NAMES["black"], 1)

        this.store = new PresentationStore(config, renderer)
        this.game = new Game(this.store)

        this.moduleCamera = new ModuleCamera(this.store)
        this.moduleInterpolation = new ModuleInterpolation(this.store)
        this.moduleParticles = new ModuleParticles(this.store)
        this.moduleUI = new ModuleUI(this.store)
        this.moduleVisual = new ModuleVisual(this.store)

        this.onReset()

        this.indexToLevel = new Map()
        this.getRocket = this.store.entities.single(...rocketComponents)

        this.store.entities.listen(
            levelComponents,
            entity => {
                this.indexToLevel.set(entity.get("level").index, entity)
            },
            entity => {
                if (entity.id === this.indexToLevel.get(entity.get("level").index)?.id) {
                    this.indexToLevel.delete(entity.get("level").index)
                }
            },
        )
    }

    onDispose() {
        const renderer = this.store.resources.get("renderer")
        renderer.dispose()
    }

    onReset() {
        this.game.onReset()
        this.moduleCamera.onReset()
    }

    onFixedUpdate(last: boolean) {
        this.tickGame()

        this.moduleInterpolation.onFixedUpdate(last)

        this.moduleUI.onFixedUpdate()
    }

    onUpdate(delta: number, overstep: number) {
        this.moduleInterpolation.onUpdate(overstep)

        this.moduleCamera.onUpdate(delta)
        this.moduleParticles.onUpdate(delta)
        // this.moduleVisual.onUpdate()

        this.render()

        this.moduleUI.onUpdate()
    }

    private tickGame() {
        const summary = this.store.resources.get("summary")

        if (summary.ticks < this.config.replay.frames.length) {
            return
        }

        const frame = this.config.replay.frames[summary.ticks]

        const rocketEntity = this.getRocket()

        const rocket = rocketEntity.get("rocket")
        const rocketTransform = rocketEntity.get("transform")
        const rocketVelocity = rocketEntity.get("velocity")

        rocket.thrust = frame.thrust

        rocketTransform.point.x = frame.transform.point.x
        rocketTransform.point.y = frame.transform.point.y
        rocketTransform.rotation = frame.transform.rotation

        rocketVelocity.x = frame.velocity.x
        rocketVelocity.y = frame.velocity.y

        if (frame.onFinish) {
            this.store.events.invoke.finished?.()
        }

        if (frame.onLevelCaptureChange) {
            const level = this.indexToLevel.get(frame.onLevelCaptureChange.level)

            if (level === undefined) {
                throw new Error(`Level with index ${level} not found`)
            }

            this.store.events.invoke.captureChanged?.({
                level,
                started: frame.onLevelCaptureChange.started,
            })
        }

        if (frame.onLevelCaptured) {
            const level = this.indexToLevel.get(frame.onLevelCaptured.level)

            if (level === undefined) {
                throw new Error(`Level with index ${level} not found`)
            }

            this.store.events.invoke.captured?.({
                level,
                rocket: this.getRocket(),
            })
        }

        if (frame.onRocketDeath) {
            this.store.events.invoke.death?.({
                contactPoint: frame.onRocketDeath.contactPoint,
                normal: frame.onRocketDeath.normal,
                rocket: this.getRocket(),
            })
        }

        summary.ticks++
    }

    private render() {
        const renderer = this.store.resources.get("renderer")
        const scene = this.store.resources.get("scene")

        renderer.clear()
        renderer.render(scene, this.moduleCamera)
    }
}
