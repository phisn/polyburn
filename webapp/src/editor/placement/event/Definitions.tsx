import { Point } from "../../world/Point"

export const isLeftButton = (e: PointerEvent) => e.buttons & 1
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
}
