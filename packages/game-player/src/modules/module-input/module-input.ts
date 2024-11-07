import { GameInput } from "game/src/game"
import { GameInputCompressed, GameInputCompressor } from "game/src/model/replay"
import { GamePlayerStore } from "../../model/store"
import { Devices } from "./devices/devices"

export interface InputCaptureResource {
    currentInput: GameInput
    inputs: GameInputCompressed[]
}

export class ModuleInput {
    private devices: Devices
    private compressor: GameInputCompressor

    constructor(private store: GamePlayerStore) {
        this.store.resources.set("inputCapture", {
            currentInput: { rotation: 0, thrust: false },
            inputs: [],
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
        inputCapture.inputs = []
    }

    onFixedUpdate() {
        this.devices.onFixedUpdate()

        const input = {
            rotation: this.devices.rotation(),
            thrust: this.devices.thrust(),
        }

        const inputCapture = this.store.resources.get("inputCapture")
        inputCapture.inputs.push(this.compressor.compress(input))
        inputCapture.currentInput = input
    }
}
