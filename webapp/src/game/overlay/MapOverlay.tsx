import { useContext, useEffect, useRef  } from "react"
import { OrthographicCamera } from "three"

import { Simulation } from "../simulation/createSimulation"
import { GameLoopContext } from "../useGameLoop"

function MapOverlay(props: { simulation: Simulation, camera: OrthographicCamera }) {
    const gameLoopContext = useContext(GameLoopContext)

    const containerDivRef = useRef<HTMLDivElement>(null!)
    const backgroundDivRef = useRef<HTMLDivElement>(null!)
    const cameraDivRef = useRef<HTMLDivElement>(null!)

    const divSize = { width: 200, height: 100 }

    if (gameLoopContext === null) {
        throw new Error("GameLoopContext is null")
    }

    // !!! TODO: still laggy because we are not doing any interpolation

    useEffect(() => gameLoopContext.subscribe(() => {
        containerDivRef.current.style.width = `${divSize.width}px`
        containerDivRef.current.style.height = `${divSize.height}px`

        backgroundDivRef.current.style.width = `${divSize.width}px`
        backgroundDivRef.current.style.height = `${divSize.height}px`

        const levelSize = {
            x: props.simulation.currentLevel.camera.topLeft.x - props.simulation.currentLevel.camera.bottomRight.x,
            y: props.simulation.currentLevel.camera.topLeft.y - props.simulation.currentLevel.camera.bottomRight.y
        }

        const top = props.simulation.currentLevel.camera.topLeft.y 
            - (props.camera.position.y + props.camera.top)

        const topPercent = top / levelSize.y

        const bottom = (props.camera.position.y + props.camera.bottom)
            - props.simulation.currentLevel.camera.bottomRight.y

        const bottomPercent = bottom / levelSize.y

        const left = props.simulation.currentLevel.camera.topLeft.x
            - (props.camera.position.x + props.camera.left)

        const leftPercent = left / levelSize.x

        const right = (props.camera.position.x + props.camera.right)
            - props.simulation.currentLevel.camera.bottomRight.x
        
        const rightPercent = right / levelSize.x

        cameraDivRef.current.style.top = `${topPercent * 100}%`
        cameraDivRef.current.style.bottom = `${bottomPercent * 100}%`
        cameraDivRef.current.style.left = `${leftPercent * 100}%`
        cameraDivRef.current.style.right = `${rightPercent * 100}%` 

        console.log(`camera left: ${props.camera.left}, right: ${props.camera.right}, top: ${props.camera.top}, bottom: ${props.camera.bottom}`)
    }))

    return (
        <>
            <div ref={containerDivRef} className="relative m-2 overflow-hidden">
                <div ref={backgroundDivRef} className="absolute bg-white opacity-20">
                </div>

                <div ref={cameraDivRef} className="absolute bg-white opacity-70">
                </div>
            </div>
        </>
    )
}

export default MapOverlay
