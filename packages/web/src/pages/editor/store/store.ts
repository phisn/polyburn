import { Point, Size } from "game/src/model/utils"
import { ROCKET_SIZE } from "game/src/modules/module-rocket"
import {
    applyPatches,
    enableMapSet,
    enablePatches,
    Immutable,
    Patch,
    produceWithPatches,
} from "immer"
import { z } from "zod"
import { create } from "zustand"
import { createEventSlice, EventSlice } from "./store-events"
import { EditorWorld } from "./world"

interface HighlightPoint {
    point: Point
    color: string
}

export interface EditorStore extends EventSlice {
    camera: Point
    cameraTarget?: { source: Point; target: Point }
    cameraZoom: number
    cameraZoomTarget?: {
        source: number
        sourcePoint: Point
        sourcePointWindow: Point
        target: number
    }
    canvasSize: Size
    setCamera(point: Point): void
    setCameraTarget(point?: Point): void
    setCameraZoomTarget(props?: { zoom: number; worldPoint: Point; windowPoint: Point }): void
    setCanvasSize(size: Size): void

    highlighted: ReadonlySet<string>
    highlightPoint?: HighlightPoint
    selected: ReadonlySet<string>
    selectedGamemode?: string
    selectedGroup?: string
    highlight(key?: string, point?: HighlightPoint): void
    select(key?: string, additive?: boolean): void
    selectGamemode(gamemode?: string): void
    selectGroup(group?: string): void

    world: Immutable<EditorWorld>
    worldRedo: WorldChange[]
    worldUndo: WorldChange[]
    undo(): void
    redo(): void
    updateWorld(f: (world: EditorWorld) => void): void
}

export interface WorldChange {
    redo: Patch[]
    undo: Patch[]
}

export const WorldChange = z.object({
    redo: z.array(z.any()),
    undo: z.array(z.any()),
})

export const useEditorStore = create<EditorStore>((set, get, api) => ({
    ...createEventSlice(set, get, api),

    camera: { x: 0, y: 0 },
    cameraTarget: undefined,
    cameraZoom: 50,
    canvasSize: { width: 0, height: 0 },
    setCamera(point) {
        set(() => ({
            camera: point,
        }))
    },
    setCameraTarget(point) {
        if (point) {
            set(state => ({
                cameraTarget: {
                    source: state.camera,
                    target: point,
                },
            }))
        } else {
            set(() => ({
                cameraTarget: undefined,
            }))
        }
    },
    setCameraZoomTarget(props) {
        set(state => {
            if (props) {
                return {
                    cameraZoomTarget: {
                        source: state.cameraZoom,
                        sourcePoint: props.worldPoint,
                        sourcePointWindow: props.windowPoint,
                        target: props.zoom,
                    },
                }
            } else {
                return {
                    cameraZoomTarget: undefined,
                }
            }
        })
    },
    setCanvasSize(size) {
        set(() => ({
            canvasSize: size,
        }))
    },

    highlighted: new Set(),
    highlightPoint: undefined,
    selected: new Set(),

    highlight(key, point) {
        if ((key && !get().highlighted.has(key)) || (!key && get().highlighted.size !== 0)) {
            set(() => ({
                highlighted: new Set<string>(key ? [key] : undefined),
                highlightPoint: point,
            }))
        } else {
            set(() => ({
                highlightPoint: point,
            }))
        }
    },
    select(key, additive) {
        set(state => {
            const selected: Set<string> = additive ? new Set(state.selected) : new Set()

            if (key) {
                const exists = get().selected.has(key)

                if (exists) {
                    selected.delete(key)
                } else {
                    selected.add(key)
                }
            }

            return {
                selected,
            }
        })
    },
    selectGamemode(gamemode) {
        set(state => {
            const selected = new Set(state.selected)
            let selectedGroup = state.selectedGroup

            if (
                gamemode &&
                selectedGroup &&
                !state.world.gamemodes[gamemode].groups.includes(selectedGroup)
            ) {
                selectedGroup = undefined
            }

            if (gamemode) {
                for (const entityKey of state.selected) {
                    const entityGroup = state.world.entities[entityKey].group

                    if (
                        entityGroup &&
                        !state.world.gamemodes[gamemode].groups.includes(entityGroup)
                    ) {
                        selected.delete(entityKey)
                    }
                }
            }

            return {
                selected,
                selectedGamemode: gamemode,
                selectedGroup,
            }
        })
    },
    selectGroup(group) {
        set(state => {
            const selected = new Set(state.selected)

            if (group !== undefined) {
                for (const entityKey of state.selected) {
                    if ((state.world.entities[entityKey].group ?? "") !== group) {
                        selected.delete(entityKey)
                    }
                }
            }

            return {
                selected,
                selectedGroup: group,
            }
        })
    },

    world: {
        gamemodes: {
            Normal: {
                groups: ["Normal", "Normal2", ""],
            },
            Reverse: {
                groups: [],
            },
            Hard: {
                groups: [],
            },
        },
        entities: {
            "first-entity": {
                type: "rocket",

                group: "Normal",
                size: ROCKET_SIZE,
                transform: {
                    point: {
                        x: 0,
                        y: 0,
                    },
                    rotation: 0,
                },
            },
            "second-entity": {
                type: "shape",
                transform: {
                    point: {
                        x: 5,
                        y: 0,
                    },
                    rotation: 0,
                },
                vertices: [
                    {
                        point: {
                            x: 3,
                            y: 3,
                        },
                        color: 0xffffff,
                    },
                    {
                        point: {
                            x: -3,
                            y: 3,
                        },
                        color: 0xffffff,
                    },
                    {
                        point: {
                            x: -2,
                            y: -3,
                        },
                        color: 0xffffff,
                    },
                    {
                        point: {
                            x: 3,
                            y: -3,
                        },
                        color: 0xffffff,
                    },
                ],
            },
        },
    },
    worldRedo: [],
    worldUndo: [],
    undo() {
        set(state => {
            if (state.worldUndo.length === 0) {
                console.warn("Tried to undo without having available undos")
                return {}
            }

            const [change, ...remaining] = state.worldUndo

            return {
                world: applyPatches(state.world, change.undo),
                worldRedo: [change, ...state.worldRedo],
                worldUndo: remaining,
            }
        })
    },
    redo() {
        set(state => {
            if (state.worldRedo.length === 0) {
                console.warn("Tried to redo without having available redos")
                return {}
            }

            const [change, ...remaining] = state.worldRedo

            return {
                world: applyPatches(state.world, change.redo),
                worldRedo: remaining,
                worldUndo: [change, ...state.worldUndo],
            }
        })
    },
    updateWorld(f) {
        set(state => {
            const [world, redo, undo] = produceWithPatches(state.world, f)

            const change: WorldChange = {
                redo,
                undo,
            }

            return {
                world,
                worldRedo: [],
                worldUndo: [change, ...state.worldUndo],
            }
        })
    },
}))

enableMapSet()
enablePatches()
