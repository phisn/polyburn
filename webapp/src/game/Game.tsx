import RAPIER from "@dimforge/rapier2d-compat"
import { OrthographicCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense, useRef } from "react"

import { baseZoom } from "../common/Values"
import { World } from "../model/world/World"
import { Rocket } from "./components/Rocket"
import { Shape } from "./components/Shape"
import { GameLoopContextProvider } from "./GameLoopContext"
import { createSimulation, Simulation } from "./simulation/createSimulation"
import { useControlsRef } from "./useControlsRef"
import { useGameLoop } from "./useGameLoop"
import { useLandscape } from "./useLandscape"

export interface GameProps {
    world: World
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rapierInit = RAPIER.init()

function Game(props: GameProps) {
    console.trace("Game")

    return (
        <div className="h-screen w-screen">
            <Canvas style={{ background: "#000000", touchAction: "none" }} >
                <Suspense>
                    <InnerGame {...props} />
                </Suspense>
            </Canvas>
        
            <div className="absolute top-0 left-0 p-4">
            </div>
        </div>
    )
}

function InnerGame(props: GameProps) {
    const simulationRef = useRef<Simulation>(
        createSimulation(props.world)
    )

    useLandscape()

    const controls = useControlsRef()

    const gameLoopContext = useGameLoop(() => {
        simulationRef.current.step({
            thrust: controls.current.thrust,
            rotation: controls.current.rotation,
            pause: controls.current.pause
        })
    })

    return (
        <GameLoopContextProvider value={gameLoopContext.current}>
            <OrthographicCamera
                makeDefault
                position={[0, 0, 10]}
                rotation={[0, 0, 0]}
                
                zoom={baseZoom / 2}
            />

            {
                props.world.shapes.map((shape, index) =>
                    <Shape key={index} vertices={shape.vertices} />
                )
            }

            {
                simulationRef.current.rockets.map((rocket, index) =>
                    <Rocket key={index} rocket={rocket} />
                )
            }

            {/* <Stats /> */}
        </GameLoopContextProvider>
    )
}

export default Game
