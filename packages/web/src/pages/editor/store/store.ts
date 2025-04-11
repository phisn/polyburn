import { Point } from "game/src/model/utils"
import { ROCKET_SIZE } from "game/src/modules/module-rocket"
import { enableMapSet, enablePatches, Immutable, Patch, produceWithPatches } from "immer"
import { create } from "zustand"
import { createEventSlice, EventSlice } from "./store-events"
import { EditorWorld } from "./world"

interface HighlightPoint {
    point: Point
    color: string
}

export interface EditorStore extends EventSlice {
    highlighted: ReadonlySet<string>
    highlightPoint?: HighlightPoint
    selected: ReadonlySet<string>
    selectedGamemode?: string
    highlight(key?: string, point?: HighlightPoint): void
    select(key?: string, additive?: boolean): void
    selectGamemode(gamemode?: string): void

    world: Immutable<EditorWorld>
    worldRedo: WorldChange[]
    worldUndo: WorldChange[]
    updateWorld(f: (world: EditorWorld) => void): void
}

export interface WorldChange {
    redo: Patch[]
    undo: Patch[]
}

export const useEditorStore = create<EditorStore>((set, get, api) => ({
    ...createEventSlice(set, get, api),

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
            const selected = []

            if (key) {
                selected.push(key)
            }

            if (additive) {
                selected.push(...state.selected)
            }

            return {
                selected: new Set(selected),
            }
        })
    },
    selectGamemode(gamemode) {
        set(() => ({
            selectedGamemode: gamemode,
        }))
    },

    world: {
        gamemodes: {
            Normal: {
                groups: [],
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
                worldUndo: [...state.worldUndo, change],
            }
        })
    },
}))

enableMapSet()
enablePatches()
