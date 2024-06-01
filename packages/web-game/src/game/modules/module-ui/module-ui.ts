import { OrthographicCamera, Scene } from "three"
import { ExtendedRuntime } from "../../runtime-extension/new-extended-runtime"
import { Timer } from "./timer"

export class ModuleUI {
    private camera: OrthographicCamera
    private scene: Scene

    private timer: Timer

    constructor(private runtime: ExtendedRuntime) {
        this.camera = new OrthographicCamera(-1, 1, 1, -1, -100, 100)
        this.scene = new Scene()

        this.timer = new Timer()
        this.scene.add(this.timer)
    }

    onFixedUpdate() {
        this.timer.onFixedUpdate()
    }

    onUpdate() {
        const width = this.runtime.factoryContext.renderer.domElement.clientWidth
        const height = this.runtime.factoryContext.renderer.domElement.clientHeight

        const min = Math.min(width, height)

        this.runtime.factoryContext.renderer.setViewport(width / 2 - min / 2, 0, min, min)
        this.runtime.factoryContext.renderer.render(this.scene, this.camera)
    }
}
