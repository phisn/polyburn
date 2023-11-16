import { Immutable, Patch, applyPatches, produce } from "immer"
import { MutableRefObject, createContext, useContext } from "react"
import { Point } from "runtime/src/model/point"
import { StoreApi, UseBoundStore, create } from "zustand"
import { BehaviorEvent, BehaviorHighlight } from "../behaviors/behaviors"
import { Entity } from "../entities/entity"
import { WorldState } from "./model/world-state"

export interface EditorStore {
    undos: Patch[][]
    redos: Patch[][]

    world: Immutable<WorldState>

    highlighted: BehaviorHighlight | undefined
    selected: number[]

    listeners: Map<number, MutableRefObject<(event: BehaviorEvent) => void>[]>

    contextMenu?: {
        element: () => JSX.Element
        point: Point
    }

    highlight(highlight: BehaviorHighlight | undefined): void

    select(...id: number[]): void
    deselect(id?: number): void

    selectedEntities(): Immutable<Entity>[]

    openContextMenu(point: Point, element: () => JSX.Element): void

    undo(): void
    redo(): void

    mutate(mutation: (state: WorldState) => void): void

    listen(id: number, listener: MutableRefObject<(event: BehaviorEvent) => void>): () => void
    publish(event: BehaviorEvent): void
}

export const createEditorStore = () =>
    create<EditorStore>((set, get) => ({
        undos: [],
        redos: [],

        world: produce(
            {
                gamemodes: [],
                entities: new Map<number, Entity>(),
            },
            () => {},
        ),

        highlighted: undefined,
        selected: [],

        listeners: new Map(),

        contextMenu: undefined,

        highlight(highlighted) {
            set(state => ({
                ...state,
                highlighted,
            }))
        },

        select(...id) {
            set(state => {
                const selected = [...state.selected, ...id].filter((value, index, self) => {
                    return self.indexOf(value) === index && state.world.entities.has(value)
                })

                return {
                    ...state,
                    selected,
                }
            })
        },
        deselect(id) {
            set(state => {
                const selected = state.selected.filter(value => value !== id)

                return {
                    ...state,
                    selected,
                }
            })
        },
        selectedEntities() {
            return get().selected.map(id => get().world.entities.get(id)!)
        },
        openContextMenu(point, element) {
            set(state => ({
                ...state,
                contextMenu: {
                    element,
                    point,
                },
            }))
        },
        undo() {
            if (get().undos.length === 0) {
                return
            }

            set(state => {
                const [changes, ...others] = state.undos
                const world = applyPatches(state.world, changes)

                return {
                    undos: [...others],
                    redos: [changes, ...state.redos],
                    world,
                    selected: state.selected.filter(id => world.entities.has(id)),
                }
            })
        },
        redo() {
            if (get().redos.length === 0) {
                return
            }

            set(state => {
                const [changes, ...others] = state.redos
                const world = applyPatches(state.world, changes)

                return {
                    undos: [changes, ...state.undos],
                    redos: [...others],
                    world: applyPatches(state.world, changes),
                    selected: state.selected.filter(id => world.entities.has(id)),
                }
            })
        },
        mutate(mutation) {
            set(state => {
                const changes: Patch[] = []
                const inverseChanges: Patch[] = []

                const world = produce(state.world, mutation, (patches, inversePatches) => {
                    changes.push(...patches)
                    inverseChanges.push(...inversePatches)
                })

                return {
                    undos: [inverseChanges, ...state.undos],
                    redos: [],
                    world,
                    selected: state.selected.filter(id => world.entities.has(id)),
                }
            })
        },
        listen(id, listener) {
            set(state => ({
                ...state,
                listeners: new Map(state.listeners).set(id, [
                    ...(state.listeners.get(id) ?? []),
                    listener,
                ]),
            }))

            return () => {
                set(state => {
                    const listeners = new Map(state.listeners)
                    listeners.delete(id)

                    return {
                        ...state,
                        listeners,
                    }
                })
            }
        },
        publish(event) {
            for (const listener of get().listeners.get(event.targetId) ?? []) {
                listener.current(event)
            }
        },
    }))

export const editorStoreContext = createContext<UseBoundStore<StoreApi<EditorStore>> | undefined>(
    undefined,
)

export function useEditorContext() {
    const store = useContext(editorStoreContext)

    if (store === undefined) {
        throw new Error("useEditorStore must be used within a EditorStoreProvider")
    }

    return store
}

export function useEditorStore<T>(selector: (store: EditorStore) => T) {
    return useEditorContext()(selector)
}
