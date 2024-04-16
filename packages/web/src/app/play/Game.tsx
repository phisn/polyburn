import { useCallback, useEffect, useState } from "react"
import { WorldModel } from "runtime/proto/world"
import { Game as NativeGame } from "web-game/src/game/game"
import { GameLoop } from "web-game/src/game/game-loop"
import { GameHooks, GameInstanceType, GameSettings } from "web-game/src/game/game-settings"

export function Game(props: { model: WorldModel; hooks: GameHooks }) {
    const [gameLoop, setGameLoop] = useState<GameLoop | null>(null)

    console.log("World2")

    const canvasRef = useCallback(
        (canvas: HTMLCanvasElement | null) => {
            if (canvas === null) {
                return
            }

            const settings: GameSettings = {
                instanceType: GameInstanceType.Play,
                canvas,
                world: props.model,
                gamemode: "Normal",
                hooks: props.hooks,
            }

            setGameLoop(new GameLoop(new NativeGame(settings)))
        },
        [props.model, props.hooks],
    )

    useEffect(() => {
        if (gameLoop) {
            gameLoop.start()
            return () => void gameLoop.stop()
        }
    }, [gameLoop])

    return <canvas className="absolute inset-0 h-full w-full" ref={canvasRef} />
}
