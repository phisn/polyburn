import { GamePlayer } from "game-web/src/game-player"
import { GameLoop } from "game-web/src/game-player-loop"
import { ReplayModel } from "game/proto/replay"
import { WorldConfig } from "game/proto/world"
import { base64ToBytes } from "game/src/model/utils"
import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ReplaySummaryDTO } from "shared/src/server/replay"
import { replayService } from "../../common/services/replay-service"
import { worldService } from "../../common/services/world-service"
import { useGlobalStore } from "../../common/store"

export interface PlayerStoreError {
    status: "error"

    error?: Error
    message: string
}

export interface PlayerStoreFinished {
    status: "finished"

    gamePlayer: GamePlayer
    replayHash: string
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

    gamePlayer: GamePlayer
}

export type PlayerStore =
    | PlayerStoreError
    | PlayerStoreFinished
    | PlayerStoreLoading
    | PlayerStoreRunning

export function usePlayerStore() {
    const [store, setStore] = useState<PlayerStore>({ status: "loading" })
    const user = useGlobalStore(x => x.currentUser)

    const upload = useCallback(async (store: PlayerStoreFinished) => {
        try {
            const response = await replayService.upload(store.replayHash)

            const replaySummary =
                response?.type === "improvement" ? response.replaySummary : undefined

            setStore({
                status: "finished",

                gamePlayer: store.gamePlayer,
                replayHash: store.replayHash,
                replayModel: store.replayModel,
                uploadStatus: "uploaded",

                replaySummary,
                bestReplaySummary: response?.bestSummary,
            })
        } catch (e) {
            useGlobalStore.getState().newAlert({
                type: "error",
                message: "Failed to upload replay",
            })

            console.error("Failed to upload replay", e)

            setStore({
                status: "finished",

                gamePlayer: store.gamePlayer,
                replayHash: store.replayHash,
                replayModel: store.replayModel,
                uploadStatus: "error",
            })
        }
    }, [])

    useEffect(() => {
        if (user && store.status === "finished" && store.uploadStatus === "unauthenticated") {
            const newStore: PlayerStoreFinished = {
                status: "finished",

                gamePlayer: store.gamePlayer,
                replayHash: store.replayHash,
                replayModel: store.replayModel,
                uploadStatus: "uploading",
            }

            setStore(newStore)
            upload(newStore)
        }
    }, [user, store, upload])

    useGamePlayer(
        (gamePlayer, gameLoop) => {
            gameLoop.start()

            setStore({
                status: "running",

                gamePlayer: gamePlayer,
            })

            gamePlayer.game.store.events.listen({
                finished: async () => {
                    try {
                        const inputCapture = gamePlayer.store.resources.get("inputCapture")

                        const config = gamePlayer.store.resources.get("config")

                        const replayHash = await replayService.commit(
                            config.worldname,
                            config.gamemode,

                            inputCapture.input,
                        )

                        setStore({
                            status: "finished",

                            gamePlayer,
                            replayHash,
                            replayModel: inputCapture.input,
                            uploadStatus: "unauthenticated",
                        })
                    } catch (e) {
                        console.error(e)
                    }
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

    return store
}

function useGamePlayer(
    onCreated: (gamePlayer: GamePlayer, gameLoop: GameLoop) => void,
    onError: (message: string, error?: Error) => void,
) {
    const [gamePair, setGamePair] = useState<[GamePlayer, GameLoop] | undefined>(undefined)

    const navigate = useNavigate()
    const params = useParams()

    const onCreatedRef = useRef(onCreated)
    const onErrorRef = useRef(onError)

    useEffect(() => {
        onCreatedRef.current = onCreated
    }, [onCreated])

    useEffect(() => {
        onErrorRef.current = onError
    }, [onError])

    useEffect(() => {
        if (params.worldname === undefined || params.gamemode === undefined) {
            console.error(params)
            navigate("/")
            return
        }

        const worldname = params.worldname
        const gamemode = params.gamemode

        let gamePlayer: GamePlayer

        worldService
            .get(params.worldname)
            .catch(error => {
                onErrorRef.current("Server failure or unreachable", error)
                throw error
            })
            .then(worldDTO => {
                if (worldDTO === undefined) {
                    onErrorRef.current("World not found")
                    return
                }

                if (worldDTO.model === undefined) {
                    onErrorRef.current("World not unlocked")
                    return
                }

                const world = WorldConfig.decode(base64ToBytes(worldDTO.model))

                gamePlayer = new GamePlayer({
                    gameConfig: {
                        gamemode,
                        world,
                        worldname,
                    },
                })

                setGamePair([gamePlayer, new GameLoop(gamePlayer)])
            })
            .catch(error => {
                onErrorRef.current("Failed to create game player", error)
                throw error
            })

        return () => {
            if (gamePlayer) {
                gamePlayer.onDispose()
            }
        }
    }, [params, navigate])

    useEffect(() => {
        if (gamePair === undefined) {
            return
        }

        onCreatedRef.current(...gamePair)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gamePair])
}

/*
function lobbyConfig(): LobbyConfigResource | undefined {
    const state = useGlobalStore.getState()

    let url

    // eslint-disable-next-line
    if (import.meta.env.DEV) {
        url = `ws://${import.meta.env.VITE_URL_SERVER}`
    } else {
        url = `wss://${import.meta.env.VITE_URL_SERVER}`
    }

    console.log(url)

    const token = authService.getJwt()

    if (token && state.currentUser) {
        return {
            lobbyWsUrl: new URL(url),
            username: state.currentUser.username,
            token,
        }
    }
}

*/
