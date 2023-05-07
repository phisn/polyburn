import { Runtime } from "../../runtime/Runtime"
import { InterpolationBodyTracker } from "./InterpolationBodyTracker"
import { InterpolationUpdate } from "./InterpolationUpdate"

export class InterpolationRuntimeTracker {
    private rocketBodyTracker: InterpolationBodyTracker
    private previousTime: number

    constructor(private runtime: Runtime) {
        this.rocketBodyTracker = new InterpolationBodyTracker(runtime.state.rocket.body)
        this.previousTime = performance.now()
    }

    public now(): InterpolationUpdate {
        const newTime = performance.now()
        
        const delta = Math.min(
            (newTime - this.previousTime) / (this.runtime.state.meta.tickRate * this.runtime.state.meta.tickRateLag),
            1.0
        )

        return {
            rocket: this.rocketBodyTracker.now(delta)
        }
    }
    
    public next() {
        this.rocketBodyTracker.next()
        this.previousTime = performance.now()
    }
}