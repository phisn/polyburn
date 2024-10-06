import { GamePlayer, GamePlayerConfig } from "game-web/src/game-player"
import { GameLoop } from "game-web/src/game-player-loop"
import { LobbyConfigResource } from "game-web/src/modules/module-lobby/module-lobby"
import { ReplayModel } from "game/proto/replay"
import { WorldConfig } from "game/proto/world"
import { createContext, useContext } from "react"
import { createStore, useStore } from "zustand"
import { useAppStore } from "../../common/store/app-store"
import { isTRPCClientError, trpcNative } from "../../common/trpc/trpc-native"
import { SummaryResource } from "game/src/modules/module-world"
import { ReplaySummaryDTO } from "shared/src/worker-api/replay"

export function usePlayStoreProvider() {

    
}

export interface FinishedStatus {
    type: "finished"
    uploadingStatus: "uploading" | "uploaded" | "unauthenticated" | "error"

    model: ReplayModel
    summary: SummaryResource

    bestReplaySummary?: ReplaySummaryDTO
    replaySummary?: ReplaySummaryDTO
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

export const createPlayStore = (config: GamePlayerConfig) => {
    const game = new GamePlayer(
        config,
        lobbyConfig(),
    )

    const store = createStore<PlayState>()((set, _get) => ({
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

        uploadReplay: async (model: ReplayModel, summary: SummaryResource) => {
            const appState = useAppStore.getState()

            if (!appState.currentUserJwt || !appState.currentUser) {
                set({
                    status: {
                        type: "finished",
                        uploadingStatus: "unauthenticated",

                        model,
                        summary,
                    },
                })

                return
            }

            set({
                status: {
                    type: "finished",
                    uploadingStatus: "uploading",

                    model,
                    summary,
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
                        summary,

                        bestReplaySummary: personalBest,
                        replaySummary: rank,
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
                            summary,
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
                            summary,
                        },
                    })
                }
            }
        },
    }))

    game.store.game.store.events.listen({
        finished: ({ rocket }) => {
            const inputCapture = game.store.resources.get("inputCapture")
            store.getState().
        },
    })

    return store
}

function lobbyConfig(): LobbyConfigResource | undefined {
    const state = useAppStore.getState()

    if (state.currentUserJwt && state.currentUser) {
        return {
            lobbyWsUrl: new URL(import.meta.env.VITE_SERVER_URL).host,
            username: state.currentUser.username,
            token: state.currentUserJwt,
        }
    }
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
