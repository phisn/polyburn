import { ReplayInput } from "game/proto/replay"
import { GameInput } from "game/src/game"
import { GameInputCompressed, GameInputCompressor } from "game/src/model/replay"
import { GamePlayerStore } from "../../model/store"
import { Devices } from "./devices/devices"

export interface InputCaptureResource {
    currentInput: GameInput
    input: ReplayInput
    modelInputs: GameInputCompressed[]
}

export class ModuleInput {
    private devices: Devices
    private compressor: GameInputCompressor

    constructor(private store: GamePlayerStore) {
        this.store.resources.set("inputCapture", {
            currentInput: { rotation: 0, thrust: false },
            input: ReplayInput.create(),
            modelInputs: [],
        })

        this.devices = new Devices(store)
        this.compressor = new GameInputCompressor()
    }

    onDispose() {
        this.devices.onDispose()
    }

    onReset() {
        this.compressor.reset()

        const inputCapture = this.store.resources.get("inputCapture")
        inputCapture.currentInput = { rotation: 0, thrust: false }
        inputCapture.modelInputs = []
    }

    onFixedUpdate() {
        this.devices.onFixedUpdate()

        const modelInput = {
            rotation: this.devices.rotation(),
            thrust: this.devices.thrust(),
        }

        const inputCapture = this.store.resources.get("inputCapture")
        inputCapture.modelInputs.push(this.compressor.compress(modelInput))
        inputCapture.currentInput = modelInput

        const realInput = this.devices.singelReplayInput()

        if (realInput) {
            inputCapture.input.inputs.push(realInput)
        }
    }
}
