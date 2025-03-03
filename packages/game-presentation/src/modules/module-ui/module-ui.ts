import { OrthographicCamera, Scene } from "three"
import { PresentationStore } from "../../store"
import { Timer } from "./timer"

export class ModuleUI {
    private camera: OrthographicCamera
    private scene: Scene

    private timer: Timer

    constructor(private store: PresentationStore) {
        this.camera = new OrthographicCamera(-1, 1, 1, -1, -100, 100)
        this.scene = new Scene()

        this.timer = new Timer(this.store)
        this.scene.add(this.timer)
    }

    onFixedUpdate() {
        this.timer.onFixedUpdate()
    }

    onUpdate() {
        const renderer = this.store.resources.get("renderer")
        const width = renderer.domElement.clientWidth
        const height = renderer.domElement.clientHeight

        const min = Math.min(width, height)

        renderer.setViewport(width / 2 - min / 2, 0, min, min)
        renderer.render(this.scene, this.camera)
    }
}
