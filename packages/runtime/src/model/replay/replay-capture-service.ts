import { f16round } from "@petamoriken/float16"
import { ReplayModel } from "../../../proto/replay"
import { RuntimeSystemContext } from "../../core/runtime-system-stack"
import { ReplayFrame, replayFramesToBytes } from "./replay"

export class ReplayCaptureService {
    private frames: ReplayFrame[] = []
    private accRotation = 0

    get replay() {
        return ReplayModel.create({
            frames: replayFramesToBytes(this.frames),
        })
    }

    captureFrame(context: RuntimeSystemContext) {
        let diff = f16round(context.rotation - this.accRotation)

        if (Math.abs(diff) < 0.0001) {
            diff = 0
        }

        this.accRotation += diff

        this.frames.push({
            diff,
            thrust: context.thrust,
        })

        return this.accRotation
    }
}
