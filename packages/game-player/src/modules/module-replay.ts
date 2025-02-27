import { ReplayFrameModel } from "game/proto/replay"
import * as THREE from "three"
import { GamePlayerStore } from "../model/store"
import { Rocket } from "./module-visual/objects/rocket"

export interface ReplayResource {
    currentFrame: number
    frames: ReplayFrameModel[]
}

export class ModuleReplay {
    private replayRocket: THREE.Object3D

    constructor(private store: GamePlayerStore) {
        this.replayRocket = new Rocket(0.5)
        this.store.resources.get("scene").add(this.replayRocket)
    }

    onFixedUpdate() {
        this.store.resources.get("replay").currentFrame++
    }

    onReset() {
        this.store.resources.get("replay").currentFrame = 0
    }
}
