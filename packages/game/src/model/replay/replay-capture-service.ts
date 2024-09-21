import { f16round } from "@petamoriken/float16"
import { ReplayModel } from "../../../proto/replay"
import { GameInput } from "../../game"
import { ReplayFrame, replayFramesToBytes } from "./replay"

export class ReplayCaptureService {
    private frames: ReplayFrame[] = []
    private accRotation = 0

    constructReplay() {
        return ReplayModel.create({
            frames: replayFramesToBytes(this.frames),
        })
    }

    captureFrame(input: GameInput) {
        let diff = f16round(input.rotation - this.accRotation)

        if (Math.abs(diff) < 0.0001) {
            diff = 0
        }

        this.accRotation += diff

        this.frames.push({
            diff,
            thrust: input.thrust,
        })

        return this.accRotation
    }
}
