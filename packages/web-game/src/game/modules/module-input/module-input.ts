import { ExtendedRuntime } from "../../runtime-extension/new-extended-runtime"
import { Keyboard } from "./keyboard"
import { Mouse } from "./mouse"

const CHARCODE_ONE = "1".charCodeAt(0)
const CHARCODE_NINE = "9".charCodeAt(0)

const inputs = [
    { rotation: 0.928602397441864, thrust: true },
    { rotation: 0.13935142755508423, thrust: true },
    { rotation: -0.8606485724449158, thrust: true },
    { rotation: -1.8606485724449158, thrust: true },
    { rotation: -0.8606485724449158, thrust: true },
    { rotation: -1.8606485724449158, thrust: true },
    { rotation: -0.8606485724449158, thrust: true },
    { rotation: -1.8606485724449158, thrust: true },
    { rotation: -0.8606485724449158, thrust: true },
    { rotation: 0.13935142755508423, thrust: true },
    { rotation: -0.8606485724449158, thrust: true },
    { rotation: 0.13935142755508423, thrust: true },
    { rotation: -0.8606485724449158, thrust: true },
    { rotation: -0.523856908082962, thrust: true },
    { rotation: -1.523856908082962, thrust: true },
    { rotation: -2.523856908082962, thrust: true },
    { rotation: -3.523856908082962, thrust: true },
    { rotation: -4.523856908082962, thrust: true },
    { rotation: -5.523856908082962, thrust: true },
    { rotation: -4.523856908082962, thrust: true },
    { rotation: -5.523856908082962, thrust: true },
    { rotation: -5.0757246017456055, thrust: true },
    { rotation: -6.0757246017456055, thrust: true },
    { rotation: -5.0757246017456055, thrust: true },
    { rotation: -6.0757246017456055, thrust: true },
    { rotation: -5.0757246017456055, thrust: true },
    { rotation: -5.493886172771454, thrust: true },
    { rotation: -4.493886172771454, thrust: true },
    { rotation: -5.4650625586509705, thrust: true },
    { rotation: -4.4650625586509705, thrust: true },
    { rotation: -5.4650625586509705, thrust: true },
    { rotation: -5.493640601634979, thrust: true },
    { rotation: -4.493640601634979, thrust: true },
    { rotation: -5.493640601634979, thrust: true },
    { rotation: -4.493640601634979, thrust: true },
    { rotation: -5.493640601634979, thrust: true },
    { rotation: -5.574220359325409, thrust: true },
    { rotation: -4.574220359325409, thrust: true },
    { rotation: -5.574220359325409, thrust: true },
    { rotation: -5.371117532253265, thrust: true },
    { rotation: -5.393860101699829, thrust: true },
    { rotation: -5.179872035980225, thrust: true },
    { rotation: -4.758336663246155, thrust: true },
    { rotation: -4.888206958770752, thrust: true },
    { rotation: -5.888206958770752, thrust: true },
    { rotation: -4.888206958770752, thrust: true },
    { rotation: -5.888206958770752, thrust: true },
    { rotation: -4.888206958770752, thrust: true },
    { rotation: -3.888206958770752, thrust: true },
    { rotation: -4.888206958770752, thrust: true },
    { rotation: -5.8682825565338135, thrust: true },
    { rotation: -4.8682825565338135, thrust: true },
    { rotation: -5.8682825565338135, thrust: true },
    { rotation: -4.8682825565338135, thrust: true },
    { rotation: -5.779716372489929, thrust: true },
    { rotation: -4.779716372489929, thrust: true },
    { rotation: -5.779716372489929, thrust: true },
    { rotation: -5.314650177955627, thrust: true },
    { rotation: -5.377287566661835, thrust: true },
    { rotation: -5.50549703836441, thrust: true },
    { rotation: -4.565630733966827, thrust: true },
    { rotation: -5.565630733966827, thrust: true },
    { rotation: -5.236084401607513, thrust: true },
    { rotation: -4.80553811788559, thrust: true },
    { rotation: -5.80553811788559, thrust: true },
    { rotation: -4.80553811788559, thrust: true },
    { rotation: -5.507085978984833, thrust: true },
    { rotation: -4.507085978984833, thrust: true },
    { rotation: -5.507085978984833, thrust: true },
    { rotation: -5.149120390415192, thrust: true },
    { rotation: -6.149120390415192, thrust: true },
    { rotation: -5.149120390415192, thrust: true },
    { rotation: -6.036867916584015, thrust: true },
    { rotation: -5.036867916584015, thrust: true },
    { rotation: -6.036867916584015, thrust: true },
    { rotation: -5.036867916584015, thrust: true },
    { rotation: -5.05073469877243, thrust: true },
    { rotation: -5.590804040431976, thrust: true },
    { rotation: -6.352537512779236, thrust: true },
    { rotation: -5.352537512779236, thrust: true },
    { rotation: -4.628996133804321, thrust: true },
    { rotation: -5.4285489320755005, thrust: true },
    { rotation: -4.843723893165588, thrust: true },
    { rotation: -5.4131468534469604, thrust: true },
    { rotation: -4.4131468534469604, thrust: true },
    { rotation: -5.4131468534469604, thrust: true },
    { rotation: -4.4131468534469604, thrust: true },
    { rotation: -5.4131468534469604, thrust: true },
    { rotation: -6.4131468534469604, thrust: true },
    { rotation: -5.716241121292114, thrust: true },
    { rotation: -6.401003062725067, thrust: true },
    { rotation: -5.401003062725067, thrust: true },
    { rotation: -5.035071134567261, thrust: true },
    { rotation: -5.827503323554993, thrust: true },
    { rotation: -4.827503323554993, thrust: true },
    { rotation: -5.827503323554993, thrust: true },
    { rotation: -4.827503323554993, thrust: true },
    { rotation: -5.827503323554993, thrust: true },
    { rotation: -4.827503323554993, thrust: true },
    { rotation: -5.827503323554993, thrust: true },
    { rotation: -4.827503323554993, thrust: true },
    { rotation: -5.827503323554993, thrust: true },
    { rotation: -5.135900259017944, thrust: true },
    { rotation: -6.135900259017944, thrust: true },
    { rotation: -5.149014234542847, thrust: true },
    { rotation: -4.686952769756317, thrust: true },
    { rotation: -5.686952769756317, thrust: false },
    { rotation: -4.686952769756317, thrust: true },
    { rotation: -5.686952769756317, thrust: true },
    { rotation: -5.333105087280273, thrust: true },
    { rotation: -5.489454597234726, thrust: true },
    { rotation: -4.489454597234726, thrust: true },
    { rotation: -5.489454597234726, thrust: true },
    { rotation: -6.159207135438919, thrust: true },
    { rotation: -5.159207135438919, thrust: true },
    { rotation: -6.159207135438919, thrust: true },
    { rotation: -5.159207135438919, thrust: true },
    { rotation: -5.264431670308113, thrust: true },
    { rotation: -5.5160354524850845, thrust: true },
    { rotation: -4.5160354524850845, thrust: true },
    { rotation: -5.5160354524850845, thrust: true },
    { rotation: -4.5160354524850845, thrust: true },
    { rotation: -5.5160354524850845, thrust: true },
    { rotation: -4.5160354524850845, thrust: true },
    { rotation: -5.5160354524850845, thrust: true },
    { rotation: -4.5160354524850845, thrust: true },
    { rotation: -5.210378661751747, thrust: true },
    { rotation: -5.789670959115028, thrust: true },
    { rotation: -5.821384325623512, thrust: true },
    { rotation: -5.038382187485695, thrust: true },
    { rotation: -6.038382187485695, thrust: true },
    { rotation: -5.038382187485695, thrust: true },
    { rotation: -6.038382187485695, thrust: true },
    { rotation: -5.038382187485695, thrust: true },
    { rotation: -5.197831615805626, thrust: true },
    { rotation: -4.203378781676292, thrust: true },
    { rotation: -5.203378781676292, thrust: true },
    { rotation: -4.203378781676292, thrust: true },
    { rotation: -5.203378781676292, thrust: true },
    { rotation: -4.203378781676292, thrust: true },
    { rotation: -5.203378781676292, thrust: true },
    { rotation: -5.559658095240593, thrust: true },
    { rotation: -4.559658095240593, thrust: true },
    { rotation: -5.559658095240593, thrust: true },
    { rotation: -4.742914721369743, thrust: true },
    { rotation: -5.742914721369743, thrust: true },
    { rotation: -4.742914721369743, thrust: true },
    { rotation: -5.742914721369743, thrust: true },
    { rotation: -4.742914721369743, thrust: true },
    { rotation: -5.742914721369743, thrust: true },
    { rotation: -4.749851331114769, thrust: true },
    { rotation: -5.749851331114769, thrust: true },
    { rotation: -4.749851331114769, thrust: true },
    { rotation: -5.749851331114769, thrust: true },
    { rotation: -4.749851331114769, thrust: true },
    { rotation: -5.749851331114769, thrust: true },
    { rotation: -4.749851331114769, thrust: true },
    { rotation: -5.749851331114769, thrust: true },
    { rotation: -5.938547268509865, thrust: true },
    { rotation: -6.0961340218782425, thrust: true },
    { rotation: -5.0961340218782425, thrust: true },
    { rotation: -5.992851212620735, thrust: true },
    { rotation: -5.3073021322488785, thrust: true },
    { rotation: -6.3073021322488785, thrust: true },
    { rotation: -5.3073021322488785, thrust: true },
    { rotation: -6.3073021322488785, thrust: true },
    { rotation: -6.077244356274605, thrust: true },
    { rotation: -6.318330153822899, thrust: true },
    { rotation: -5.318330153822899, thrust: true },
    { rotation: -6.318330153822899, thrust: true },
    { rotation: -5.438394114375114, thrust: true },
    { rotation: -5.514149233698845, thrust: true },
    { rotation: -6.514149233698845, thrust: true },
    { rotation: -6.433003231883049, thrust: true },
    { rotation: -5.433003231883049, thrust: true },
    { rotation: -6.433003231883049, thrust: true },
    { rotation: -5.61981026828289, thrust: true },
    { rotation: -6.61981026828289, thrust: true },
    { rotation: -6.839142426848412, thrust: true },
    { rotation: -5.839142426848412, thrust: true },
    { rotation: -6.839142426848412, thrust: true },
    { rotation: -6.279265388846397, thrust: true },
    { rotation: -7.279265388846397, thrust: true },
    { rotation: -6.315085455775261, thrust: true },
    { rotation: -7.315085455775261, thrust: true },
    { rotation: -6.7484916895627975, thrust: true },
    { rotation: -7.7484916895627975, thrust: true },
    { rotation: -6.7484916895627975, thrust: true },
]

export class ModuleInput {
    private keyboard: Keyboard
    private mouse: Mouse

    private rotationSpeed = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0]
    private rotationSpeedIndex = 2

    private c: { rotation: number; thrust: boolean } = { rotation: 0, thrust: false }
    private i = 0

    constructor(runtime: ExtendedRuntime) {
        this.keyboard = new Keyboard()
        this.mouse = new Mouse(runtime)

        this.onContextMenu = this.onContextMenu.bind(this)
        document.addEventListener("contextmenu", this.onContextMenu)

        this.onKeyboardDown = this.onKeyboardDown.bind(this)
        window.addEventListener("keydown", this.onKeyboardDown)
    }

    dispose() {
        this.keyboard.dispose()
        this.mouse.dispose()

        document.removeEventListener("contextmenu", this.onContextMenu)
        window.removeEventListener("keydown", this.onKeyboardDown)
    }

    rotation() {
        return this.c.rotation
    }

    thrust() {
        return this.c.thrust
    }

    onPreFixedUpdate(delta: number) {
        this.keyboard.onPreFixedUpdate(delta)
        this.c = inputs[this.i % inputs.length]
        ++this.i
    }

    onKeyboardDown(event: KeyboardEvent) {
        if (event.repeat) {
            return
        }

        if (event.key.charCodeAt(0) >= CHARCODE_ONE && event.key.charCodeAt(0) <= CHARCODE_NINE) {
            this.rotationSpeedIndex = event.key.charCodeAt(0) - CHARCODE_ONE

            this.keyboard.setRotationSpeed(this.rotationSpeed[this.rotationSpeedIndex])
            this.mouse.setRotationSpeed(this.rotationSpeed[this.rotationSpeedIndex])
        }
    }

    private onContextMenu(event: Event) {
        event.preventDefault()
    }
}
