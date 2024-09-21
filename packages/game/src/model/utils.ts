import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"

export interface Point {
    x: number
    y: number
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
