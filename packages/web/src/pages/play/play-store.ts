import { createContext, useContext } from "react"
import { ReplayModel } from "runtime/proto/replay"
import { WorldModel } from "runtime/proto/world"
import { base64ToBytes } from "runtime/src/model/base64-to-bytes"
import { ReplayStats } from "runtime/src/model/replay/replay-stats"
import { Game } from "web-game/src/game/game"
import { GameLoop } from "web-game/src/game/game-loop"
import { GameHooks } from "web-game/src/game/game-settings"
import { createStore, useStore } from "zustand"
import { useAppStore } from "../../common/store/app-store"
import { isTRPCClientError, trpcNative } from "../../common/trpc/trpc-native"

export interface FinishedStatus {
    type: "finished"
    uploadingStatus: "uploading" | "uploaded" | "unauthenticated" | "error"

    model: ReplayModel
    deaths: number
    ticks: number

    personalBest?: ReplayStats & { rank: number }
    rank?: number
}

export interface RunningStatus {
    type: "running"
}

export type PlayStatus = FinishedStatus | RunningStatus

export interface PlayStoreProps {
    worldname: string
    gamemode: string
    model: WorldModel
}

export interface PlayState extends PlayStoreProps {
    status: PlayStatus

    game: Game
    gameLoop: GameLoop

    getCanvas(): HTMLCanvasElement

    reset(): void
    stop(): void
    resume(): void

    uploadReplay(model: ReplayModel, ticks: number, deaths: number): void
}

export type PlayStore = ReturnType<typeof createPlayStore>

export const createPlayStore = (props: PlayStoreProps) => {
    const hooks: GameHooks = {
        onFinished: () => {
            const model = game.runtime.factoryContext.replayCapture.constructReplay()
            const deaths = game.runtime.factoryContext.store.world.components.stats!.deaths
            const ticks = game.runtime.factoryContext.store.world.components.stats!.ticks

            store.getState().uploadReplay(model, ticks, deaths)
        },

        onUserJoined: _user => {
            /*
            const appState = useAppStore.getState()
            appState.newAlert({
                type: "info",
                message: `${user.username} joined the game`,
            })
            */
        },
        onUserLeft: _username => {
            /*
            const appState = useAppStore.getState()
            appState.newAlert({
                type: "info",
                message: `${username} left the game`,
            })
            */
        },

        onConnected: _userCount => {
            /*
            const appState = useAppStore.getState()
            appState.newAlert({
                type: "info",
                message: `Connected to server with ${userCount} other users`,
            })
            */
        },
        onDisconnected: () => {
            /*
            const appState = useAppStore.getState()
            appState.newAlert({
                type: "warning",
                message: "Disconnected from server",
            })
            */
        },
    }

    const state = useAppStore.getState()
    let lobby

    if (state.jwt && state.user) {
        lobby = {
            host: new URL(import.meta.env.VITE_SERVER_URL).host,
            username: state.user.username,
            token: state.jwt,
        }
    }

    const game = new Game({
        instanceType: "play",

        worldname: props.worldname,
        world: props.model,
        gamemode: props.gamemode,

        hooks: hooks,
        lobby: lobby,
    })

    const gameLoop = new GameLoop(game)

    const store = createStore<PlayState>()((set, _get) => ({
        ...props,
        status: { type: "running" },
        game: null!,
        gameLoop: null!,

        getCanvas: () => game.domElement(),
        reset: () => {},
        stop: () => {
            gameLoop.stop()
        },
        resume: () => {
            gameLoop.start()
        },

        uploadReplay: async (model: ReplayModel, ticks: number, deaths: number) => {
            const appState = useAppStore.getState()

            if (!appState.jwt || !appState.user) {
                set({
                    status: {
                        type: "finished",
                        uploadingStatus: "unauthenticated",

                        model,
                        deaths,
                        ticks,
                    },
                })

                return
            }

            set({
                status: {
                    type: "finished",
                    uploadingStatus: "uploading",

                    model,
                    deaths,
                    ticks,
                },
            })

            try {
                const { personalBest, rank } = await trpcNative.validateReplay.mutate({
                    worldname: props.worldname,
                    gamemode: props.gamemode,
                    replayModelBase64: bytesToBase64(ReplayModel.encode(model).finish()),
                })

                console.log("Personal best", personalBest, "Rank", rank)

                set({
                    status: {
                        type: "finished",
                        uploadingStatus: "uploaded",

                        model,
                        deaths,
                        ticks,

                        personalBest,
                        rank,
                    },
                })
            } catch (e) {
                console.error(e)
                if (isTRPCClientError(e) && e.data?.code === "UNAUTHORIZED") {
                    set({
                        status: {
                            type: "finished",
                            uploadingStatus: "unauthenticated",

                            model,
                            deaths,
                            ticks,
                        },
                    })
                } else {
                    console.error(e)

                    appState.newAlert({
                        type: "error",
                        message: "Error validating replay",
                    })

                    set({
                        status: {
                            type: "finished",
                            uploadingStatus: "error",

                            model,
                            deaths,
                            ticks,
                        },
                    })
                }
            }
        },
    }))

    store
        .getState()
        .uploadReplay(
            ReplayModel.decode(
                base64ToBytes(
                    "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H50AAAUfnQAAAR6dH6EfnR+hHqEfoR+dH6EenR+hHqEfoR+hHp0foa6jH50enR+hH6EeoR+hH6Eeoa6nr6MfpR2dAAADH50fnQAASB8dHyEfIR4hHx0fIR4dHx0fHR8hHh0fHQAAAR4dHx0AAAEfHQAABh8dAAABHh0fHR8dAAABHh0fHR8dHx0AAAEeHQAAAx8dAAABHx0AAAEfHQAABB4dAAABHx0AAAIfIR4dHx0fHR8hHiEfJR8lZiYfJa0jHyEAAAEfIQAAAR4dHx0AABMfoa6jH6Vmpmamr6Ouox+hHp0AAB4fnQAAAR+hrqOuox6hH6EfoQAAAR+dAAACHp0AABeuIx8hriOuI2YmeyhmJmcmZiavIx4dAAAKrqMfqR6pe6h7qB+pZqpnqh6pr6cfnR6dAAABH50AAAEfnQAAAh+dHp0fnR+dHp0fnQAAAR+hrqMfoR6hAAABH50foR+dHqEgna6jH6Wto6+jHqEfoR+dHp0fnR+dH50enR+hAAACHp0foR+hHp2uox+lHqEfoR+dHp0foR+hHp0AAAEfnR6dAAABH50fnQAAAR+dH6EenR6dH50fnR+hrqOuo66jrqMfoa6jH6Wtox+hH6EAABUfHQAAAh8dHx0AAAEfIR4hHyVmJh8pZioKK2cqCitnKnoorycfJR0dHx0AAAMfHQAACh+drqOuox+hH6UepWemH6Wtox+dAAAHriNmJh8lZyZmJh8lHiWvIx8hHiEfHR8dAAABHx0AAAUfHR4hHyGuI2cmHikgJR4lIB0fIQAACx+dH50AAHQfHR8hHh0fIR4dAAABHx0fHR8dAAABHh0AAAIfHQAAAR8hHh0fHR8hHiEgHR4dHx0fHR8hHiEfIR8hHh0fHR8dHh0fIR4dHyEfHR4dHx0fHR8dAAABHh0fHQAAAR8dHh0AAAIfHR8dHx0AAAEeHQAAAh8dAAABHx0AAAEeHQAAAh8dAAABHx0AAAIfHQAAdK6jH6UfpR6lr6MfpWame6iup2amZ6YeoR+dH6UepR+lH6UeoR+hH50foR6hrqOuox+hrqOuox+lrqMfoa6jH6UepR+lH6UeoR+hHp0fnR+dH50AAAEenQAAAx+dAAABH50enR+dH6Guox+hHqEfnR+dAAABH50foR6dH50enR+dH50foR6dH6EAAAEenR+hHp0foR6dH50AAAEfnR+dHp0AAAEfnQAAAR+dAAABH50enQAAJR4dAAAFHx0fHR8dHh2uI64jriMfIR8dHyEeHR8dHx0AAAQeHQAAAR8dHyEeISAdriMfHR4hHyGuIx8hHyEeIR8hHx0fHR4dAAABHyEfHR4dHyEfIa4jHyWuJ64neyjCKXsoeyhnJq4nZiauJ2YmHyWvIx4hriMfHR8dHx0AAAgfnR+hrqMeoa+jHqEfpR+lHqEfoR6hH6Guox+hAAA7PAAAAAAvAWQAGAF9ABUBCgAIARsATQEwABYBDgAPAaIAWQF/ABUBUgAHARgASQE1ABMBSAAOAf8BBgATAUgAFQErAAoBHQBiAdwAHQEUABMBJAA/AckAGwEkAAkBJgAJASUADAEbAGEByQAcAUgADAERAAoBHwAHAScANw==",
                ),
            ),
            3751,
            3,
        )

    /*
    const replayStr =
        "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NgAGAW8ACwFQAAQBCQANAW8AEgEsAP8AQAEtACMBTQAQAUYAFAERAAkBRwARAUwADwFiAA8B2wAUAQUAEgGVAB0BTQDKAS0AIQFJACEBeAANAQwACgEIAAYBEAAEAR0ABQE9ACUBVAAUAWAAHgEOAA4BRwASAWIAEAGHABMBbAAeAUgAIgFbABIBdQAVAZkACgEaAAsBQwAHAQoACgEKAAgBLwAFARMACAEFAA4BPQATATwAQQFmAB0B5QAcAUcAEgH/AdcAGQENAAkBLQAOAQ0ABwEGAAQBGQBLARIACQF3ABUBBQALAQ8ABgEMAAoBCgAEAS8ACwGJABABDwALAQcADAEYAAIBZQAHAXIAIAEQAAYBGwAHAQkADAGUABUBDQAMAQkACAFoAAsBIgANAToAEwF4ACABawAfATkACAEMAAwBbgAWAQ4ACgEHAAsBCQAGAXQACgE0AA0BCwALARUACAEqAAgBwgAaARoABwEGAAQBBgAKARsAAwFwABsBCAAIAQ8ABQEMAAkBDQAKAYAAIwF1ABQBCwANAQoABwFsABQBDgAKAQ4AAwEGAAoBCAABAQcABQERAAQBJAAHAXkAHgE4AAwBCAAHAQ8ABwEUAGUBOAAcARUAEAGvAAQBBQAFAT4AEQEvAAoBBwAFASAABgGIACkBTgAKASMABgEcAHE="
    */
    //    store.getState().uploadReplay(ReplayModel.decode(base64ToBytes(replayStr)), 11728, 0)

    return store
}

export const playStoreContext = createContext<PlayStore | undefined>(undefined)

export function usePlayStore<T>(selector: (state: PlayState) => T) {
    const store = useContext(playStoreContext)

    if (!store) {
        throw new Error("playStoreContext not provided")
    }

    return useStore(store, selector)
}

function bytesToBase64(bytes: Uint8Array) {
    const binString = Array.from(bytes, x => String.fromCodePoint(x)).join("")
    return btoa(binString)
}
