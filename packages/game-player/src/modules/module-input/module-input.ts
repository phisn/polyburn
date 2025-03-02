import { ReplayInputModel } from "game/proto/replay"
import { GameInput } from "game/src/game"
import { GamePlayerStore } from "../../model/store"
import { Devices } from "./devices/devices"

export interface InputCaptureResource {
    currentInput: GameInput
    input: ReplayInputModel
    started: boolean
}

export class ModuleInput {
    private devices: Devices

    constructor(private store: GamePlayerStore) {
        this.store.resources.set("inputCapture", {
            currentInput: { rotation: 0, thrust: false },
            input: ReplayInputModel.create({
                worldname: store.resources.get("config").worldname,
                gamemode: store.resources.get("config").gamemode,
            }),
            started: false,
        })

        this.devices = new Devices(store)
    }

    onDispose() {
        this.devices.onDispose()
    }

    onReset() {
        const inputCapture = this.store.resources.get("inputCapture")
        inputCapture.currentInput = { rotation: 0, thrust: false }
        inputCapture.input = ReplayInputModel.create({ frames: [] })
        inputCapture.started = false
    }

    onFixedUpdate() {
        const inputCapture = this.store.resources.get("inputCapture")

        this.devices.onFixedUpdate()

        if (inputCapture.started === false) {
            inputCapture.started = this.devices.thrust()
        }

        if (inputCapture.started) {
            inputCapture.currentInput = {
                rotation: this.devices.rotation(),
                thrust: this.devices.thrust(),
            }

            inputCapture.input.frames.push({
                ...inputCapture.currentInput,
                ...this.devices.singelReplayInput(),
            })
        }
    }
}
