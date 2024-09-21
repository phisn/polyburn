import { OrthographicCamera, Scene } from "three"
import { WebGameStore } from "../../model/store"
import { Timer } from "./timer"

export class ModuleUI {
    private camera: OrthographicCamera
    private scene: Scene

    private timer: Timer

    constructor(private store: WebGameStore) {
        this.camera = new OrthographicCamera(-1, 1, 1, -1, -100, 100)
        this.scene = new Scene()

        this.timer = new Timer()
        this.scene.add(this.timer)
    }

    onFixedUpdate() {
        this.timer.onFixedUpdate()
    }

    onUpdate() {
        const width = this.store.renderer.domElement.clientWidth
        const height = this.store.renderer.domElement.clientHeight

        const min = Math.min(width, height)

        this.store.renderer.setViewport(width / 2 - min / 2, 0, min, min)
        this.store.renderer.render(this.scene, this.camera)
    }
}
