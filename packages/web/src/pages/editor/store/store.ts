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
    selectedGroup?: string
    highlight(key?: string, point?: HighlightPoint): void
    select(key?: string, additive?: boolean): void
    selectGamemode(gamemode?: string): void
    selectGroup(group?: string): void

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
                groups: ["Normal"],
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
