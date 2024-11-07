import { GamePlayer } from "game-web/src/game-player"
import { GameLoop } from "game-web/src/game-player-loop"
import { GamePlayerStore } from "game-web/src/model/store"
import { LobbyConfigResource } from "game-web/src/modules/module-lobby/module-lobby"
import { ReplayModel } from "game/proto/replay"
import { WorldConfig } from "game/proto/world"
import { encodeInputCompressed } from "game/src/model/replay"
import { base64ToBytes } from "game/src/model/utils"
import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ReplaySummaryDTO } from "shared/src/server/replay"
import { authService } from "../../common/services/auth-service"
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

    gamePlayerStore: GamePlayerStore
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

    gamePlayerStore: GamePlayerStore
}

export type PlayerStore =
    | PlayerStoreError
    | PlayerStoreFinished
    | PlayerStoreLoading
    | PlayerStoreRunning

export function usePlayerStore() {
    const [store, setStore] = useState<PlayerStore>({ status: "loading" })
    const user = useGlobalStore(x => x.currentUser)

    const upload = useCallback(async () => {
        if (store.status !== "finished") {
            throw new Error(`Tried to upload during "${store.status}" state`)
        }

        try {
            const response = await replayService.upload(store.replayHash)

            const replaySummary =
                response?.type === "improvement" ? response.replaySummary : undefined

            setStore({
                status: "finished",

                gamePlayerStore: store.gamePlayerStore,
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

                gamePlayerStore: store.gamePlayerStore,
                replayHash: store.replayHash,
                replayModel: store.replayModel,
                uploadStatus: "error",
            })
        }
    }, [store])

    useEffect(() => {
        if (user && store.status === "finished" && store.uploadStatus === "unauthenticated") {
            setStore({
                status: "finished",

                gamePlayerStore: store.gamePlayerStore,
                replayHash: store.replayHash,
                replayModel: store.replayModel,
                uploadStatus: "uploading",
            })

            upload()
        }
    }, [user, store, upload])

    useGamePlayer(
        (gamePlayer, gameLoop) => {
            gameLoop.start()

            setStore({
                status: "running",

                gamePlayerStore: gamePlayer.store,
            })

            gamePlayer.store.game.store.events.listen({
                finished: async () => {
                    const replayModel = ReplayModel.create({
                        deltaInputs: encodeInputCompressed(
                            gamePlayer.store.resources.get("inputCapture").inputs,
                        ),
                    })

                    const config = gamePlayer.store.resources.get("config")

                    const replayHash = await replayService.commit(
                        config.worldname,
                        config.gamemode,
                        replayModel,
                    )

                    if (authService.getState() === "authenticated") {
                        setStore({
                            status: "finished",

                            gamePlayerStore: gamePlayer.store,
                            replayHash,
                            replayModel,
                            uploadStatus: "uploading",
                        })

                        upload()
                    } else {
                        setStore({
                            status: "finished",

                            gamePlayerStore: gamePlayer.store,
                            replayHash,
                            replayModel,
                            uploadStatus: "unauthenticated",
                        })
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

    useEffect(() => {
        if (params.worldname === undefined || params.gamemode === undefined) {
            navigate("/")
            return
        }

        const worldname = params.worldname
        const gamemode = params.gamemode

        worldService
            .get(params.worldname)
            .catch(error => {
                onError("Server failure or unreachable", error)
                throw error
            })
            .then(worldDTO => {
                if (worldDTO === undefined) {
                    onError("World not found")
                    return
                }

                if (worldDTO.model === undefined) {
                    onError("World not unlocked")
                    return
                }

                const world = WorldConfig.decode(base64ToBytes(worldDTO.model))

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
    const state = useGlobalStore.getState()

    let url

    // eslint-disable-next-line
    if (import.meta.env.DEV) {
        url = `ws://${import.meta.env.VITE_SERVER_URL}`
    } else {
        url = `wss://${import.meta.env.VITE_SERVER_URL}`
    }

    const token = authService.getJwt()

    if (token && state.currentUser) {
        return {
            lobbyWsUrl: new URL(url).host,
            username: state.currentUser.username,
            token,
        }
    }
}
