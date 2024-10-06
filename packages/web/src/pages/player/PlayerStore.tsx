import { GamePlayer } from "game-web/src/game-player"
import { GameLoop } from "game-web/src/game-player-loop"
import { GamePlayerStore } from "game-web/src/model/store"
import { LobbyConfigResource } from "game-web/src/modules/module-lobby/module-lobby"
import { ReplayModel } from "game/proto/replay"
import { replayFramesToBytes } from "game/src/model/replay"
import { ReactNode, createContext, useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ReplaySummaryDTO } from "shared/src/worker-api/replay"
import { useAppStore } from "../../common/store/app-store"
import { trpcNative } from "../../common/trpc/trpc-native"

export interface PlayerStoreError {
    status: "error"

    error: Error
    message: string
}

export interface PlayerStoreFinished {
    status: "finished"

    gamePlayerStore: GamePlayerStore
    replayModel: ReplayModel
    uploadStatus: "uploading" | "uploaded" | "unauthenticated" | "error"

    bestReplaySummary?: ReplaySummaryDTO
    replaySummary?: ReplaySummaryDTO
}

export interface PlayerStoreLoading {
    status: "loading"
}

export interface PlayerStoreRunning {
    status: "running"

    gamePlayerStore: GamePlayerStore
}

type PlayerStore = PlayerStoreError | PlayerStoreFinished | PlayerStoreLoading | PlayerStoreRunning

export function usePlayerStore(): PlayerStore {
    const state = useContext(playStoreContext)

    if (!state) {
        throw new Error("usePlayerStore must be used within a ProvidePlayerStore")
    }

    return state
}

export async function ProvidePlayerStore(props: { children: ReactNode }) {
    const [store, setStore] = useState<PlayerStore>({ status: "loading" })

    useGamePlayer(
        (gamePlayer, gameLoop) => {
            gameLoop.start()

            setStore({
                status: "running",

                gamePlayerStore: gamePlayer.store,
            })

            gamePlayer.store.game.store.events.listen({
                finished: () => {
                    const replayModel = ReplayModel.create({
                        frames: replayFramesToBytes(
                            gamePlayer.store.resources.get("inputCapture").frames,
                        ),
                    })

                    setStore({
                        status: "finished",

                        gamePlayerStore: gamePlayer.store,
                        replayModel,
                    })
                },
            })
        },
        (message, error) =>
            setStore({
                status: "error",

                message,
                error,
            }),
    )

    return <playStoreContext.Provider value={store}>{props.children}</playStoreContext.Provider>
}

const playStoreContext = createContext<PlayerStore | undefined>(undefined)

function useGamePlayer(
    onCreated: (gamePlayer: GamePlayer, gameLoop: GameLoop) => void,
    onError: (message: string, error: Error) => void,
) {
    const [gamePair, setGamePair] = useState<[GamePlayer, GameLoop] | undefined>(undefined)

    const navigate = useNavigate()
    const params = useParams()

    useEffect(() => {
        if (params.worldname === undefined || params.gamemode === undefined) {
            navigate("/")
            return
        }

        const worldname = params.worldname
        const gamemode = params.gamemode

        trpcNative.world.get
            .query({ names: [params.worldname] })
            .catch(error => {
                onError("World not found or server unreachable", error)
                throw error
            })
            .then(([world]) => {
                const gamePlayer = new GamePlayer(
                    {
                        gamemode,
                        world,
                        worldname,
                    },
                    lobbyConfig(),
                )

                setGamePair([gamePlayer, new GameLoop(gamePlayer)])
            })
            .catch(error => {
                onError("Failed to create game player", error)
                throw error
            })

        return () => {
            const [gamePlayer] = gamePair ?? []

            if (gamePlayer) {
                gamePlayer.onDispose()
            }
        }
    }, [gamePair, params.worldname, params.gamemode, navigate, onError])

    useEffect(() => {
        if (gamePair === undefined) {
            return
        }

        onCreated(...gamePair)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gamePair])
}

function lobbyConfig(): LobbyConfigResource | undefined {
    const state = useAppStore.getState()

    let url

    if (import.meta.env.DEV) {
        url = `ws://${import.meta.env.VITE_SERVER_URL}`
    } else {
        url = `wss://${import.meta.env.VITE_SERVER_URL}`
    }

    if (state.currentUserJwt && state.currentUser) {
        return {
            lobbyWsUrl: new URL(url).host,
            username: state.currentUser.username,
            token: state.currentUserJwt,
        }
    }
}
