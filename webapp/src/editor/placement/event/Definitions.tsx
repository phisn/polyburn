import { Point } from "../../world/Point"

export const isLeftButton = (params: PointerHandlerParams) => 
    // but it is pressed now
    (params.event.buttons & 1) === 1

export const isLeftButtonNew = (params: PointerHandlerParams) => 
    // left click was not pressed previously
    (params.previousEvent?.buttons ?? 0 & 1) === 0 && 
    // but it is pressed now
    (params.event.buttons & 1) === 1

export const isInsideCanvas = (e: PointerEvent, canvas: HTMLCanvasElement) => 
    e.clientX >= 0 && e.clientX <= canvas.clientWidth && 
    e.clientY >= 0 && e.clientY <= canvas.clientHeight

export interface PointerHandlerParams<T = any> {
    action: T

    canvas: HTMLCanvasElement
    camera: THREE.Camera
    raycaster: THREE.Raycaster
    scene: THREE.Scene

    point: Point
    event: PointerEvent
    previousEvent?: PointerEvent
}
