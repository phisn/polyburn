import { f16round } from "@petamoriken/float16"
import { RuntimeSystemContext } from "../../core/RuntimeSystemStack"
import { Replay } from "./Replay"

export class ReplayCaptureService {
    private _replay: Replay = {
        frames: [],
    }

    private _accRotation = 0

    get replay() {
        return this._replay
    }

    captureFrame(context: RuntimeSystemContext) {
        let diff = f16round(context.rotation - this._accRotation)

        if (Math.abs(diff) < 0.0001) {
            diff = 0
        }

        this._accRotation += diff

        this._replay.frames.push({
            diff,
            thrust: context.thrust,
        })

        return this._accRotation
    }
}
