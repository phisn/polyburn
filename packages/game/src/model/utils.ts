import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"
import { z } from "zod"

export type Point = z.infer<typeof Point>
export const Point = z.object({
    x: z.number(),
    y: z.number(),
})

export type Transform = z.infer<typeof Transform>
export const Transform = z.object({
    point: Point,
    rotation: z.number(),
})

export type Rect = z.infer<typeof Rect>
export const Rect = z.object({
    left: z.number(),
    top: z.number(),
    right: z.number(),
    bottom: z.number(),
})

export type Size = z.infer<typeof Size>
export const Size = z.object({
    width: z.number(),
    height: z.number(),
})

export type ShapeVertex = z.infer<typeof ShapeVertex>
export const ShapeVertex = z.object({
    point: Point,
    color: z.number(),
})

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
