import { EntityWith } from "game/src/framework/entity"
import { Point, Rect, Transform } from "game/src/model/utils"
import { subscribe } from "valtio/vanilla"

export interface EditorComponents {
    bounding: Rect
    identity: {
        bundleId: number
        type: "object" | "shape"
    }
    shape: {
        vertices: EditorShapeVertex[]
    }
    size: {
        width: number
        height: number
    }
    transform: Transform
}

export interface EditorShapeVertex {
    point: Point
    color: number
}

export interface EditorModel {
    entityBundles: Map<number, EditorEntityBundle>
    gamemodes: Map<string, EditorGamemode>
    groups: Map<number, EditorGroup>
}

export type EditorEntityBundle = EntityBundleLevel | EntityBundleRocket | EntityBundleShape

export interface EntityBundleLevel {
    id: number
    type: "level"

    bounding: EntityWith<EditorComponents, "bounding" | "identity" | "transform">
    flag: EntityWith<EditorComponents, "identity" | "transform">
}

export interface EntityBundleRocket {
    id: number
    type: "rocket"

    rocket: EntityWith<EditorComponents, "identity" | "size" | "transform">
}

export interface EntityBundleShape {
    id: number
    type: "shape"

    shape: EntityWith<EditorComponents, "identity" | "shape" | "transform">
}

export interface EditorGamemode {
    name: string
}

export interface EditorGroup {
    id: number
    name: string
}

export function subscribeMapChanges<K>(props: {
    value: Map<K, unknown>
    added?: (key: K) => void
    removed?: (key: K) => void
}): () => void {
    let previous = new Set<K>(props.value.keys())

    if (props.added) {
        for (const key of previous) {
            props.added(key)
        }
    }

    return subscribe(props.value, () => {
        const keys = new Set(props.value.keys())

        if (props.added) {
            for (const added of keys.difference(previous)) {
                props.added(added)
            }
        }

        if (props.removed) {
            for (const removed of previous.difference(keys)) {
                props.removed(removed)
            }
        }

        previous = keys
    })
}
