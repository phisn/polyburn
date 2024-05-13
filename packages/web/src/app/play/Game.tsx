import { useCallback, useEffect, useState } from "react"
import { WorldModel } from "runtime/proto/world"
import { Game as NativeGame } from "web-game/src/game/game"
import { GameAgentAsPlayer } from "web-game/src/game/game-agent-as-player"
import { GameLoop } from "web-game/src/game/game-loop"
import { GameHooks, GameInstanceType, GameSettings } from "web-game/src/game/game-settings"

export function Game(props: {
    worldname: string
    gamemode: string
    model: WorldModel
    hooks: GameHooks
}) {
    const [gameLoop, setGameLoop] = useState<GameLoop | null>(null)

    const canvasRef = useCallback(
        (canvas: HTMLCanvasElement | null) => {
            if (canvas === null) {
                return
            }

            const settings: GameSettings = {
                instanceType: GameInstanceType.Play,
                canvas,

                worldname: props.worldname,
                world: props.model,
                gamemode: props.gamemode,
                hooks: props.hooks,
            }

            if (window.location.hash.includes("ai")) {
                setGameLoop(new GameLoop(new GameAgentAsPlayer(settings)))
            } else {
                setGameLoop(new GameLoop(new NativeGame(settings)))
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
