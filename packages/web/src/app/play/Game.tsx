import { useCallback, useEffect, useRef, useState } from "react"
import { WorldModel } from "runtime/proto/world"
import { GameInterface, Game as NativeGame } from "web-game/src/game/game"
import { GameAgentAsPlayer } from "web-game/src/game/game-agent-as-player"
import { GameLoop } from "web-game/src/game/game-loop"
import { GameHooks, GameSettings } from "web-game/src/game/game-settings"
import { useAppStore } from "../../common/storage/app-store"

export function Game(props: {
    worldname: string
    gamemode: string
    model: WorldModel
    hooks: GameHooks
}) {
    const gameRef = useRef<GameInterface | null>(null)
    const [gameLoop, setGameLoop] = useState<GameLoop | null>(null)

    const canvasRef = useCallback(
        (canvas: HTMLCanvasElement | null) => {
            if (gameRef.current) {
                console.log("Disposing game")
                gameRef.current.dispose()
            }

            if (!canvas) {
                return
            }

            const state = useAppStore.getState()
            let user

            if (state.user && state.jwt) {
                user = {
                    username: state.user.username,
                    token: state.jwt,
                }
            }

            const settings: GameSettings = {
                instanceType: "play",
                canvas,

                worldname: props.worldname,
                world: props.model,
                gamemode: props.gamemode,
                hooks: props.hooks,

                lobby: user,
            }

            if (window.location.hash.includes("ai")) {
                gameRef.current = new GameAgentAsPlayer(settings)
                setGameLoop(new GameLoop(gameRef.current!))
            } else {
                gameRef.current = new NativeGame(settings)
                setGameLoop(new GameLoop(gameRef.current))
            }
        },
        [props.model, props.hooks, props.gamemode, props.worldname],
    )

    useEffect(() => {
        if (gameLoop) {
            gameLoop.start()
            return () => void gameLoop.stop()
        }
    }, [gameLoop])

    return (
        <canvas
            style={{
                position: "relative",
                height: "100%",
                width: "100%",
                overflow: "hidden",
                pointerEvents: "auto",
                touchAction: "none",
                WebkitUserSelect: "none",
            }}
            className="absolute inset-0 z-0 h-full w-full select-none"
            ref={canvasRef}
        />
    )
}
