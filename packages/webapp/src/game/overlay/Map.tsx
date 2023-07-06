import { useMemo,useRef } from "react"
import { RocketEntityComponents } from "runtime/src/core/rocket/RocketEntity"
import { OrthographicCamera } from "three"

import { useGameStore } from "../store/GameStore"
import { useGraphicUpdate } from "../store/useGraphicUpdate"

export default function Map(props: { camera: OrthographicCamera }) {
    const { store } = useGameStore(state => state.systemContext)

    const rockets = useMemo(
        () => store.newSet(...RocketEntityComponents),
        [store]
    )

    const containerDivRef = useRef<HTMLDivElement>(null!)
    const backgroundDivRef = useRef<HTMLDivElement>(null!)
    const cameraDivRef = useRef<HTMLDivElement>(null!)

    const divSize = { width: 200, height: 100 }

    useGraphicUpdate((ticked) => {
        if (ticked === false) {
            return
        }

        const [rocket] = rockets

        containerDivRef.current.style.width = `${divSize.width}px`
        containerDivRef.current.style.height = `${divSize.height}px`

        backgroundDivRef.current.style.width = `${divSize.width}px`
        backgroundDivRef.current.style.height = `${divSize.height}px`

        const levelSize = {
            x: rocket.components.rocket.currentLevel.components.level.camera.topLeft.x - rocket.components.rocket.currentLevel.components.level.camera.bottomRight.x,
            y: rocket.components.rocket.currentLevel.components.level.camera.topLeft.y - rocket.components.rocket.currentLevel.components.level.camera.bottomRight.y
        }

        const top = rocket.components.rocket.currentLevel.components.level.camera.topLeft.y 
            - (props.camera.position.y + props.camera.top)

        const topPercent = top / levelSize.y

        const bottom = (props.camera.position.y + props.camera.bottom)
            - rocket.components.rocket.currentLevel.components.level.camera.bottomRight.y

        const bottomPercent = bottom / levelSize.y

        const left = rocket.components.rocket.currentLevel.components.level.camera.topLeft.x
            - (props.camera.position.x + props.camera.left)

        const leftPercent = left / levelSize.x

        const right = (props.camera.position.x + props.camera.right)
            - rocket.components.rocket.currentLevel.components.level.camera.bottomRight.x
        
        const rightPercent = right / levelSize.x

        cameraDivRef.current.style.top = `${topPercent * 100}%`
        cameraDivRef.current.style.bottom = `${bottomPercent * 100}%`
        cameraDivRef.current.style.left = `${leftPercent * 100}%`
        cameraDivRef.current.style.right = `${rightPercent * 100}%` 
    })

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
