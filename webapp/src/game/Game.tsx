import RAPIER from "@dimforge/rapier2d-compat"
import { OrthographicCamera } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense, useEffect, useRef } from "react"

import { World } from "../model/world/World"
import { Rocket } from "./components/Rocket"
import { Shape } from "./components/Shape"
import { createSimulation, Simulation } from "./simulation/createSimulation"
import { useGameLoop } from "./useGameLoop"

export interface GameProps {
    world: World
}

interface ControlsRef {
    thrust: boolean
    rotation: number
}

function useControlsRef() {
    const controlsRef = useRef<ControlsRef>({
        thrust: false,
        rotation: 0,
    })

    useEffect(() => {
        // TODO: Capture events in future

        const pointerEvent = (event: PointerEvent) => {
            controlsRef.current.thrust = ((event.buttons & 1) === 1)
        }

        window.addEventListener("pointerdown", pointerEvent)
        window.addEventListener("pointerup", pointerEvent)
        window.addEventListener("pointermove", pointerEvent)

        return () => {
            window.removeEventListener("pointerdown", pointerEvent)
            window.removeEventListener("pointerup", pointerEvent)
            window.removeEventListener("pointermove", pointerEvent)
        }
    })

    return controlsRef
}

const rapierInit = RAPIER.init()

export function Game(props: GameProps) {
    return (
        <div className="h-screen w-screen">
            <Canvas style={{ background: "#000000" }} >
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

    const controls = useControlsRef()

    useGameLoop(() => {
        simulationRef.current.step({
            thrust: controls.current.thrust,
            rotation: controls.current.rotation,
        })
    })

    return (
        <>
            <OrthographicCamera
                makeDefault
                position={[0, 0, 10]}
                rotation={[0, 0, 0]}
            />

            {
                props.world.shapes.map((shape, index) =>
                    <Shape key={index} vertices={shape.vertices} />
                )
            }

            {
                simulationRef.current.rockets.map((rocket, index) =>
                    <Rocket key={index} body={rocket} />
                )
            }

            {/* <Stats /> */}
        </>
    )
}

export default Game
