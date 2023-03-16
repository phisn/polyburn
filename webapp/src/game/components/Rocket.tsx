import { Svg } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Suspense, useContext, useRef } from "react"
import { MathUtils, Object3D, Vector3 } from "three"

import { entities } from "../../model/world/Entities"
import { EntityType } from "../../model/world/Entity"
import { scale } from "../../model/world/Size"
import { changeAnchor } from "../../utility/math"
import { GameLoopContext } from "../GameLoopContext"
import { SimulationRocket } from "../simulation/createRocket"

export function Rocket(props: { rocket: SimulationRocket }) {
    const svgRef = useRef<Object3D>(null!)

    const gameLoopContext = useContext(GameLoopContext)
    
    const entry = entities[EntityType.Rocket]
    const size = scale(entry.size, entry.scale)

    let previousTime = 0
    
    let previousRotation = 0
    let newRotation = props.rocket.body.rotation()

    const lerpVector = new Vector3()

    const previousPosition = new Vector3()
    const newPosition = new Vector3(
        props.rocket.body.translation().x,
        props.rocket.body.translation().y,
        0
    )

    useFrame(() => {
        if (props.rocket.body.isSleeping() === false) {
            if (previousTime !== gameLoopContext.timeAtLastFrame) {
                previousTime = gameLoopContext.timeAtLastFrame
                
                const position = props.rocket.body.translation()
                const rotation = props.rocket.body.rotation()

                previousRotation = newRotation
                newRotation = rotation

                previousPosition.set(
                    newPosition.x,
                    newPosition.y,
                    0
                )

                newPosition.set(
                    position.x,
                    position.y,
                    0
                )
            }

            const newTime = performance.now()
            const delta = (newTime - previousTime) / gameLoopContext.timePerFrame

            lerpVector.set(
                MathUtils.lerp(
                    previousPosition.x, 
                    newPosition.x,
                    delta
                ),
                MathUtils.lerp(
                    previousPosition.y,
                    newPosition.y,
                    delta
                ),
                0
            )

            const lerpRotation = MathUtils.lerp(
                previousRotation,
                newRotation,
                delta
            )

            const positionRotated = changeAnchor(
                lerpVector,
                lerpRotation,
                size,
                { x: 0.5, y: 0.5 },
                entry.anchor
            )
            
            svgRef.current.position.set(
                positionRotated.x,
                positionRotated.y,
                0
            )
            
            svgRef.current.rotation.set(
                0, 
                0, 
                lerpRotation
            )
        }
    })

    return (
        <Suspense>
            <Svg
                ref={svgRef}
                src={entry.src}
                scale={entry.scale} />
        </Suspense>
    )
}
