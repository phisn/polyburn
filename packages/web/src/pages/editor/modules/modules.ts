import { ROCKET_SIZE } from "game/src/modules/module-rocket"
import { OrthographicCamera, Scene, WebGLRenderer } from "three"
import { proxy } from "valtio"
import { proxyMap } from "valtio/utils"
import { EditorStore } from "../store/store"
import { ModuleCanvasInput } from "./module-canvas-input/module-canvas-input"
import { ModuleCanvas } from "./module-canvas/module-canvas"

export class EditorModules {
    private moduleCanvas: ModuleCanvas
    private moduleInput: ModuleCanvasInput

    constructor(private store: EditorStore) {
        store.resources.set("camera", new OrthographicCamera(-10, 10, 10, -10, -100, 100))
        store.resources.set("model", {
            entityBundles: proxyMap(),
            gamemodes: proxyMap(),
            groups: proxyMap(),
        })
        store.resources.set("renderer", new WebGLRenderer())
        store.resources.set("scene", new Scene())
        store.resources.set(
            "selection",
            proxy({
                selected: [],
            }),
        )

        const camera = store.resources.get("camera")
        const scene = store.resources.get("scene")
        scene.add(camera)

        this.moduleCanvas = new ModuleCanvas(store)
        this.moduleInput = new ModuleCanvasInput(store)

        store.resources.get("model").entityBundles.set(0, {
            type: "rocket",
            rocket: store.entities.create({
                identity: proxy({
                    bundleId: 0,
                    type: "object",
                }),
                size: proxy(ROCKET_SIZE),
                transform: proxy({
                    point: {
                        x: 0,
                        y: 0,
                    },
                    rotation: 0,
                }),
            }),
        })
    }

    onDispose() {
        this.moduleCanvas.onDispose()
        this.moduleInput.onDispose()
    }
}
