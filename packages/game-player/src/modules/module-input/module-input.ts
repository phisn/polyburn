import { f16round } from "@petamoriken/float16"
import { GameInput } from "game/src/game"
import { ReplayFrame } from "game/src/model/replay/replay"
import { GamePlayerStore } from "../../model/store"
import { Devices } from "./devices/devices"

export interface InputCaptureResource {
    currentInput: GameInput
    frames: ReplayFrame[]
}

export class ModuleInput {
    private devices: Devices
    private rotationaAccumulated: number

    constructor(private store: GamePlayerStore) {
        this.store.resources.set("inputCapture", {
            currentInput: { rotation: 0, thrust: false },
            frames: [],
        })

        this.devices = new Devices(store)
        this.rotationaAccumulated = 0
    }

    onDispose() {
        this.devices.onDispose()
    }

    onReset() {
        this.rotationaAccumulated = 0

        const inputCapture = this.store.resources.get("inputCapture")
        inputCapture.currentInput = { rotation: 0, thrust: false }
        inputCapture.frames = []
    }

    onFixedUpdate() {
        this.devices.onFixedUpdate()

        let changeRounded = f16round(this.devices.rotation() - this.rotationaAccumulated)
        if (Math.abs(changeRounded) < MINIMAL_CHANGE_TO_CAPTURE) {
            changeRounded = 0
        }
        this.rotationaAccumulated += changeRounded

        const inputCapture = this.store.resources.get("inputCapture")
        inputCapture.currentInput = {
            thrust: this.devices.thrust(),
            rotation: this.rotationaAccumulated,
        }
        inputCapture.frames.push({
            diff: changeRounded,
            thrust: inputCapture.currentInput.thrust,
        })
    }
}

const MINIMAL_CHANGE_TO_CAPTURE = 0.0001
