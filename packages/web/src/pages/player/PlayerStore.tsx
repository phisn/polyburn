import { PresentationGameLoop } from "game-presentation/src/presentation-game-loop"
import { PresentationPlay } from "game-presentation/src/presentation-play"
import { ReplayInputModel } from "game/proto/replay"
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

    gamePlayer: PresentationPlay
    replayHash: string
    replayModel: ReplayInputModel
    uploadStatus: "uploading" | "uploaded" | "unauthenticated" | "error"

    bestReplaySummary?: ReplaySummaryDTO
    replaySummary?: ReplaySummaryDTO
}

export interface PlayerStoreLoading {
    status: "loading"
}

export interface PlayerStoreRunning {
    status: "running"

    gamePlayer: PresentationPlay
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

            gamePlayer.store.events.listen({
                finished: async () => {
                    try {
                        const inputCapture = gamePlayer.store.resources.get("inputCapture")
                        const input = inputCapture.reconstructInput()

                        const config = gamePlayer.store.resources.get("config")

                        const replayHash = await replayService.commit(
                            config.worldname,
                            config.gamemode,

                            input,
                        )

                        setStore({
                            status: "finished",

                            gamePlayer,
                            replayHash,
                            replayModel: input,
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
    onCreated: (gamePlayer: PresentationPlay, gameLoop: PresentationGameLoop) => void,
    onError: (message: string, error?: Error) => void,
) {
    const [presentationPair, setPresentation] = useState<
        [PresentationPlay, PresentationGameLoop] | undefined
    >(undefined)

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

        let presentationPlay: PresentationPlay

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

                presentationPlay = new PresentationPlay({
                    gamemode,
                    world,
                    worldname,
                })

                setPresentation([presentationPlay, new PresentationGameLoop(presentationPlay)])
            })
            .catch(error => {
                onErrorRef.current("Failed to create game player", error)
                throw error
            })

        return () => {
            if (presentationPlay) {
                presentationPlay.onDispose()
            }
        }
    }, [params, navigate])

    useEffect(() => {
        if (presentationPair === undefined) {
            return
        }

        onCreatedRef.current(...presentationPair)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [presentationPair])
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
