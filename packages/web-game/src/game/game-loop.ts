import { Game } from "./game"

export class GameLoop {
    private animationFrame: number | undefined
    private previous_time: DOMHighResTimeStamp | undefined
    private loop_time = 0

    private tickrate = 1000 / 60

    constructor(private game: Game) {
        this.tick = this.tick.bind(this)
    }

    public start() {
        this.animationFrame = requestAnimationFrame(this.tick)
    }

    public stop() {
        if (this.animationFrame !== undefined) {
            cancelAnimationFrame(this.animationFrame)
            this.animationFrame = undefined
        }
    }

    private tick(time: DOMHighResTimeStamp) {
        this.animationFrame = requestAnimationFrame(this.tick)

        if (this.previous_time === undefined) {
            this.previous_time = time
        }

        const delta = time - this.previous_time!
        this.loop_time += delta
        this.previous_time = time

        this.game.onPreFixedUpdate(delta)

        while (this.loop_time > this.tickrate) {
            this.loop_time -= this.tickrate
            this.game.onFixedUpdate(this.loop_time <= this.tickrate)
        }

        // console.log("delta: ", delta, "overstep: ", this.loop_time / this.tickrate)

        this.game.onUpdate(delta, this.loop_time / this.tickrate)
    }
}
