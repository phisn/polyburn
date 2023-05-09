import { Point } from "../../model/world/Point"

export const isInsideCanvas = (e: EditorInputEvent, canvas: HTMLCanvasElement) => 
    e.windowPoint.x >= 0 && e.windowPoint.x <= canvas.clientWidth && 
    e.windowPoint.y >= 0 && e.windowPoint.y <= canvas.clientHeight
    
export interface EditorInputEvent {
    windowPoint: Point
    
    delete: boolean
    snap: boolean

    leftButton: boolean
    rightButton: boolean
}

export interface PointerHandlerParams<T = void> {
    action: T

    canvas: HTMLCanvasElement
    camera: THREE.Camera
    raycaster: THREE.Raycaster
    scene: THREE.Scene

    point: Point
    pointMaybeSnapped: Point

    event: EditorInputEvent
    previousEvent?: EditorInputEvent
}
