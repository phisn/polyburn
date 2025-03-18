import { OrthographicCamera, Scene, WebGLRenderer } from "three"
import { createStore } from "zustand"

export interface EditorStore {
    camera: OrthographicCamera
    renderer: WebGLRenderer
    scene: Scene
}

export const editorStore = createStore<EditorStore>((_set, _get) => ({
    camera: new OrthographicCamera(),
    renderer: new WebGLRenderer(),
    scene: new Scene(),
}))
