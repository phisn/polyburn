import { create } from "zustand"

export interface EditorStore {
    selected: number[]
}

const createEditorStore = (world: WorldState) =>
    create<WorldStore>((set, get) => ({
        state: {
            world,
            todo: [],
            done: [],
        },
        canUndo: false,
        canRedo: false,
        running: false,
        mutation(generator) {
            while (generator instanceof Function) {
                generator = generator(get().state.world)
            }

            const mutation = generator

            mutation.do(get().state.world)

            set(store => ({
                state: {
                    world: store.state.world,
                    todo: [],
                    done: [...store.state.done, mutation],
                },
                canRedo: false,
                canUndo: true,
            }))
        },
        redo() {
            const last = get().state.todo[get().state.todo.length - 1]
            last.do(get().state.world)

            set(store => ({
                state: {
                    world: store.state.world,
                    todo: [...store.state.todo.slice(0, store.state.todo.length - 1)],
                    done: [...store.state.done, last],
                },
                canRedo: store.state.todo.length > 1,
                canUndo: true,
            }))
        },
        undo() {
            const last = get().state.done[get().state.done.length - 1]
            last.undo(get().state.world)

            set(store => ({
                state: {
                    world: store.state.world,
                    todo: [...store.state.todo, last],
                    done: [...store.state.done.slice(0, store.state.done.length - 1)],
                },
                canRedo: true,
                canUndo: store.state.done.length > 1,
            }))
        },

        selectGamemode(gamemode: GamemodeState) {
            set({ gamemode })
        },

        run() {
            set({ running: true })
        },

        stop() {
            set({ running: false })
        },
    }))
