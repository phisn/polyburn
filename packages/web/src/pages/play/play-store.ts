import { WebGame } from "game-web/src/game-player"
import { GameLoop } from "game-web/src/game-player-loop"
import { GameHooks } from "game-web/src/model/settings"
import { ReplayModel } from "game/proto/replay"
import { WorldConfig } from "game/proto/world"
import { replayFramesToBytes } from "game/src/model/replay/replay"
import { createContext, useContext } from "react"
import { createStore, useStore } from "zustand"
import { useAppStore } from "../../common/store/app-store"
import { isTRPCClientError, trpcNative } from "../../common/trpc/trpc-native"

export interface FinishedStatus {
    type: "finished"
    uploadingStatus: "uploading" | "uploaded" | "unauthenticated" | "error"

    model: ReplayModel
    deaths: number
    ticks: number

    personalBest?: { deaths: number; ticks: number; rank: number }
    rank?: number
}

export interface RunningStatus {
    type: "running"
}

export type PlayStatus = FinishedStatus | RunningStatus

export interface PlayStoreProps {
    worldname: string
    gamemode: string
    world: WorldConfig
}

export interface PlayState extends PlayStoreProps {
    status: PlayStatus

    game: WebGame
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
            const model = ReplayModel.create({
                frames: replayFramesToBytes(game.store.resources.get("inputCapture").frames),
            })

            const summary = game.store.game.store.resources.get("summary")

            store.getState().uploadReplay(model, summary.ticks, summary.deaths)
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

    const game = new WebGame({
        instanceType: "play",

        worldname: props.worldname,
        world: props.world,
        gamemode: props.gamemode,

        hooks: hooks,
        lobby: lobby,
    })

    const gameLoop = new GameLoop(game)

    const store = createStore<PlayState>()((set, _get) => ({
        ...props,
        status: { type: "running" },
        game,
        gameLoop,

        getCanvas: () => game.store.resources.get("renderer").domElement,
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
