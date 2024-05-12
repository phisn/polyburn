import { EntityWith } from "runtime-framework"
import { RuntimeComponents } from "runtime/src/core/runtime-components"
import { RuntimeSystemContext } from "runtime/src/core/runtime-system-stack"
import { Runtime } from "runtime/src/runtime"
import * as THREE from "three"
import { ModuleSceneAgent } from "./modules/module-scene-agent/module-scene-agent"
import { ReplayFollowTracker } from "./reward/replay-follow-tracker"

export class GameAgentWrapper {
    sceneModule: ModuleSceneAgent
    camera: THREE.OrthographicCamera

    private rocket: EntityWith<RuntimeComponents, "rigidBody">

    private trackerIndicator?: THREE.Mesh

    constructor(
        private runtime: Runtime,
        scene: THREE.Scene,
        grayScale: boolean,
        cameraSize: number,
        private tracker?: ReplayFollowTracker,
    ) {
        scene.background = new THREE.Color(0)
        this.sceneModule = new ModuleSceneAgent(scene, runtime, grayScale)

        this.camera = new THREE.OrthographicCamera(
            -cameraSize,
            cameraSize,
            cameraSize,
            -cameraSize,
            -1000,
            1000,
        )

        this.rocket = runtime.factoryContext.store.find("rocket", "rigidBody")[0]

        this.camera.position.set(
            this.rocket.components.rigidBody.translation().x,
            this.rocket.components.rigidBody.translation().y,
            10,
        )

        this.sceneModule.onUpdate()

        if (tracker) {
            this.trackerIndicator = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial({ color: 0xffffff }),
            )

            this.sceneModule.getScene().add(this.trackerIndicator)
        }
    }

    step(context: RuntimeSystemContext) {
        this.runtime.step(context)

        this.sceneModule.onUpdate()

        this.camera.position.set(
            this.rocket.components.rigidBody.translation().x,
            this.rocket.components.rigidBody.translation().y,
            10,
        )

        if (this.tracker && this.trackerIndicator) {
            this.tracker.step()
            this.trackerIndicator.position.set(this.tracker.next().x, this.tracker.next().y, 0)
        }
    }
}
