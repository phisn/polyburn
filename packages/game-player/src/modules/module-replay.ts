import { ReplayFrame } from "game/src/model/replay"
import * as THREE from "three"
import { GamePlayerStore } from "../model/store"
import { Rocket } from "./module-visual/objects/rocket"

export interface ReplayResource {
    frames: ReplayFrame[]
}

export class ModuleReplay {
    private currentFrame: number
    private replayRocket: THREE.Object3D

    constructor(private store: GamePlayerStore) {
        this.currentFrame = 0
        this.replayRocket = new Rocket(0.5)
    }

    onFixedUpdate() {
        this.currentFrame++
    }

    onReset() {
        this.currentFrame = 0

        const replay = this.store.resources.get("replay")
        const replayFrame = replay.frames[this.currentFrame]

        this.replayRocket.position.set(replayFrame.position.x, replayFrame.position.y, -0.1)
        this.replayRocket.rotation.z = replayFrame.rotation
    }
}
