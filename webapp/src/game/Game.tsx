import RAPIER from "@dimforge/rapier2d-compat"
import { Canvas, useThree } from "@react-three/fiber"
import { Suspense, useRef } from "react"
import tunnel from "tunnel-rat"

import { WorldModel } from "../model/world/WorldModel"
import Level from "./components/Level"
import { Rocket } from "./components/Rocket"
import { Shape } from "./components/Shape"
import GameCameraAnimated from "./GameCamera"
import Overlay from "./overlay/Overlay"
import { Runtime } from "./runtime/Runtime"
import { useControls } from "./useControls"
import { GameLoopContextProvider, useGameLoop } from "./useGameLoop"
import { ProvideGameStore, useGameStore } from "./useGameStore"
import { useLandscape } from "./useLandscape"

export interface GameProps {
    world: WorldModel
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rapierInit = RAPIER.init()
const overlay = tunnel()

function Game(props: GameProps) {
    const runtimeRef = useRef<Runtime>(new Runtime(props.world))

    return (
        <ProvideGameStore runtime={runtimeRef.current}>
            <div className="h-screen w-screen select-none" style={{
                touchAction: "none", 
                userSelect: "none",

                // Prevent canvas selection on ios
                // https://github.com/playcanvas/editor/issues/160
                WebkitTouchCallout: "none",
                WebkitUserSelect: "none",
                WebkitTapHighlightColor: "rgba(255,255,255,0)",
            }}>
                <Canvas style={{ background: "#000000" }} >
                    <Suspense>
                        <InnerGame {...props} />
                    </Suspense>
                </Canvas>
            
                <overlay.Out />
            </div>
        </ProvideGameStore>
    )
}

function InnerGame(props: GameProps) {
    useLandscape()

    const runtime = useGameStore(state => state.runtime)
    const controls = useControls()

    const gameLoopContext = useGameLoop(() => {
        runtime.step({
            thrust: controls.current.thrust,
            rotation: controls.current.rotation,
            pause: controls.current.pause
        })
    })

    const camera = useThree(state => state.camera) as THREE.OrthographicCamera

    return (
        <>
            <overlay.In>
                <GameLoopContextProvider value={gameLoopContext.current}>
                    <Overlay camera={camera} />
                </GameLoopContextProvider>
            </overlay.In>
            
            <GameLoopContextProvider value={gameLoopContext.current}>
                <GameCameraAnimated />

                {
                    props.world.shapes.map((shape, index) =>
                        <Shape key={index} vertices={shape.vertices} />
                    )
                }

                {
                    <Rocket rocket={runtime.state.rocket} />
                }

                {
                    runtime.state.levels.map((level, index) =>
                        <Level key={index} level={level} rocket={runtime.state.rocket} />
                    )
                }

                {/* <Stats /> */}
            </GameLoopContextProvider>
        </>
    )
}

export default Game
