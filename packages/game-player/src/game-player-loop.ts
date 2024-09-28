export interface GameLoopRunnable {
    onFixedUpdate(last: boolean): void
    onUpdate(delta: number, overstep: number): void
}

export class GameLoop {
    private animationFrame: number | undefined
    private previous_time: DOMHighResTimeStamp | undefined
    private loop_time = 0

    private tickrate = 1000 / 60

    constructor(private runnable: GameLoopRunnable) {
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

        while (this.loop_time > this.tickrate) {
            this.loop_time -= this.tickrate
            this.runnable.onFixedUpdate(this.loop_time <= this.tickrate)
        }

        this.runnable.onUpdate(delta, this.loop_time / this.tickrate)
    }
}
