import { Point } from "game/src/model/utils"
import { Immutable } from "immer"
import { snapDistance } from "../../../constants"
import { EditorEntityWith } from "../../../store/world"

export type BoundsSide = "left" | "right" | "top" | "bottom"
export const boundsSides: BoundsSide[] = ["top", "right", "bottom", "left"]

export function findCameraLineCloseTo(
    entity: Immutable<EditorEntityWith<"bounds" | "transform">>,
    point: Point,
) {
    const lines = linesFromBounds(entity)

    let closestLine: BoundsSide | undefined
    let closestDistance = Number.MAX_SAFE_INTEGER

    for (const [key, [p1, p2]] of Object.entries(lines)) {
        const distance = distanceToLine(point, p1, p2)

        if (distance < closestDistance) {
            closestLine = key as BoundsSide
            closestDistance = distance
        }
    }

    if (closestDistance > snapDistance) {
        return undefined
    }

    return closestLine
}

export function distanceToLine(point: Point, p1: [number, number], p2: [number, number]) {
    const [x1, y1] = p1
    const [x2, y2] = p2

    const A = point.x - x1
    const B = point.y - y1
    const C = x2 - x1
    const D = y2 - y1

    const dot = A * C + B * D
    const len_sq = C * C + D * D
    const param = dot / len_sq

    let xx, yy

    if (param < 0 || (x1 === x2 && y1 === y2)) {
        xx = x1
        yy = y1
    } else if (param > 1) {
        xx = x2
        yy = y2
    } else {
        xx = x1 + param * C
        yy = y1 + param * D
    }

    const dx = point.x - xx
    const dy = point.y - yy

    return Math.sqrt(dx * dx + dy * dy)
}

export function linesFromBounds(entity: Immutable<EditorEntityWith<"bounds" | "transform">>) {
    const corners: { [key: string]: [number, number] } = {
        topLeft: [
            entity.bounds.left + entity.transform.point.x,
            entity.bounds.top + entity.transform.point.y,
        ],
        topRight: [
            entity.bounds.right + entity.transform.point.x,
            entity.bounds.top + entity.transform.point.y,
        ],
        bottomRight: [
            entity.bounds.right + entity.transform.point.x,
            entity.bounds.bottom + entity.transform.point.y,
        ],
        bottomLeft: [
            entity.bounds.left + entity.transform.point.x,
            entity.bounds.bottom + entity.transform.point.y,
        ],
    }

    const lines = {
        top: [corners.topLeft, corners.topRight],
        right: [corners.topRight, corners.bottomRight],
        bottom: [corners.bottomRight, corners.bottomLeft],
        left: [corners.bottomLeft, corners.topLeft],
    }

    return lines
}

export function chooseAxis(side: BoundsSide, point: Point): number {
    return side === "bottom" || side === "top" ? point.y : point.x
}
