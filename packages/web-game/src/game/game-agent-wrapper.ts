import { EntityWith } from "runtime-framework"
import { RuntimeComponents } from "runtime/src/core/runtime-components"
import { RuntimeSystemContext } from "runtime/src/core/runtime-system-stack"
import { Runtime } from "runtime/src/runtime"
import * as THREE from "three"
import { ModuleSceneAgent } from "./modules/module-scene-agent/module-scene-agent"

export class GameAgentWrapper {
    sceneModule: ModuleSceneAgent
    camera: THREE.OrthographicCamera

    private rocket: EntityWith<RuntimeComponents, "rigidBody">

    constructor(
        private runtime: Runtime,
        scene: THREE.Scene,
    ) {
        scene.background = new THREE.Color(0)
        this.sceneModule = new ModuleSceneAgent(scene, runtime)

        this.camera = new THREE.OrthographicCamera(-16, 16, 16, -16, -1000, 1000)
        this.rocket = runtime.factoryContext.store.find("rocket", "rigidBody")[0]

        this.camera.position.set(
            this.rocket.components.rigidBody.translation().x,
            this.rocket.components.rigidBody.translation().y,
            10,
        )

        this.sceneModule.onUpdate()
    }

    step(context: RuntimeSystemContext) {
        this.runtime.step(context)

        this.sceneModule.onUpdate()

        this.camera.position.set(
            this.rocket.components.rigidBody.translation().x,
            this.rocket.components.rigidBody.translation().y,
            10,
        )
    }
}
