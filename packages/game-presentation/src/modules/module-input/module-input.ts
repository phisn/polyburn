import { RealInputModel, ReplayInputModel } from "game/proto/replay"
import { GameInput } from "game/src/game"
import {
    DeterminsticInput,
    encodeDeterministicInput,
    InputDeterminism,
} from "game/src/model/deterministic-input"
import { PresentationStore } from "../../store"
import { Devices } from "./devices/devices"

export interface InputResource {
    currentInput: GameInput
    started: boolean

    reconstructInput: () => ReplayInputModel
}

export class ModuleInput {
    private devices: Devices
    private inputDeterminsim: InputDeterminism

    private inputChanges: DeterminsticInput[]
    private inputReal: RealInputModel[]

    constructor(private store: PresentationStore) {
        const config = store.resources.get("config")

        this.store.resources.set("inputCapture", {
            currentInput: { rotation: 0, thrust: false },
            started: false,

            reconstructInput: () => {
                return ReplayInputModel.create({
                    worldname: config.worldname,
                    gamemode: config.gamemode,

                    inputDeterministic: encodeDeterministicInput(this.inputChanges),
                    inputReal: this.inputReal,
                })
            },
        })

        this.devices = new Devices(store)
        this.inputDeterminsim = new InputDeterminism()

        this.inputChanges = []
        this.inputReal = []
    }

    onDispose() {
        this.devices.onDispose()
    }

    onReset() {
        this.inputDeterminsim.reset()

        const inputCapture = this.store.resources.get("inputCapture")

        inputCapture.currentInput = { rotation: 0, thrust: false }
        inputCapture.started = false

        this.inputChanges = []
        this.inputReal = []
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

            this.inputChanges.push(this.inputDeterminsim.process(inputCapture.currentInput))
            this.inputReal.push(this.devices.singelReplayInput())
        }
    }
}
