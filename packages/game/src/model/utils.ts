import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"

export interface Point {
    x: number
    y: number
}

export interface Transform {
    point: Point
    rotation: number
}

export interface Rect {
    left: number
    top: number
    right: number
    bottom: number
}

export interface Size {
    width: number
    height: number
}

export const changeAnchor = (
    position: Point,
    rotation: number,
    size: Size,
    sourceAnchor: Point,
    targetAnchor: Point,
) => ({
    x:
        position.x +
        cos(rotation) * (size.width * (targetAnchor.x - sourceAnchor.x)) -
        sin(rotation) * (size.height * (targetAnchor.y - sourceAnchor.y)),
    y:
        position.y +
        sin(rotation) * (size.width * (targetAnchor.x - sourceAnchor.x)) +
        cos(rotation) * (size.height * (targetAnchor.y - sourceAnchor.y)),
})

export function lerpTransform(previous: Transform, next: Transform, t: number): Transform {
    return {
        point: {
            x: lerp(previous.point.x, next.point.x, t),
            y: lerp(previous.point.y, next.point.y, t),
        },
        rotation: slerp(previous.rotation, next.rotation, t),
    }
}

export function lerp(previous: number, next: number, t: number) {
    return (1 - t) * previous + t * next
}

export function slerp(previous: number, next: number, t: number) {
    const difference = next - previous
    const shortestAngle = (((difference % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI

    return previous + shortestAngle * t
}

export function bytesToBase64(bytes: Uint8Array) {
    const binString = Array.from(bytes, x => String.fromCodePoint(x)).join("")
    return btoa(binString)
}

export function base64ToBytes(base64: string) {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0))
}
