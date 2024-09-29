import { GamePlayer } from "game-web/src/game-player"
import { GameLoop } from "game-web/src/game-player-loop"
import { LobbyConfigResource } from "game-web/src/modules/module-lobby/module-lobby"
import { ReplayModel } from "game/proto/replay"
import { WorldConfig } from "game/proto/world"
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

    game: GamePlayer
    gameLoop: GameLoop

    getCanvas(): HTMLCanvasElement

    reset(): void
    stop(): void
    resume(): void

    uploadReplay(model: ReplayModel, ticks: number, deaths: number): void
}

export type PlayStore = ReturnType<typeof createPlayStore>

export const createPlayStore = (props: PlayStoreProps) => {
    const state = useAppStore.getState()

    let lobbyConfig: LobbyConfigResource | undefined = undefined
    if (state.jwt && state.user) {
        lobbyConfig = {
            lobbyWsUrl: new URL(import.meta.env.VITE_SERVER_URL).host,
            username: state.user.username,
            token: state.jwt,
        }
    }

    const game = new GamePlayer(
        {
            worldname: props.worldname,
            world: props.world,
            gamemode: props.gamemode,
        },
        lobbyConfig,
    )

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
