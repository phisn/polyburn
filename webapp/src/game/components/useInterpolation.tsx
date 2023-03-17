import RAPIER from "@dimforge/rapier2d-compat"
import { useFrame } from "@react-three/fiber"
import { useContext } from "react"
import { MathUtils, Vector3 } from "three"

import { Point } from "../../model/world/Point"
import { GameLoopContext } from "../GameLoopContext"

export function useInterpolation(
    body: RAPIER.RigidBody, 
    callback: (point: Point, rotation: number) => void,
    disable?: boolean
) {
    const gameLoopContext = useContext(GameLoopContext)
    
    let previousTime = 0
    
    let previousRotation = 0
    let newRotation = body.rotation()

    const lerpVector = new Vector3()

    const previousPosition = new Vector3()
    const newPosition = new Vector3(
        body.translation().x,
        body.translation().y,
        0
    )
    
    useFrame(() => {
        if (body.isSleeping() === false) {
            if (disable) {
                callback(
                    body.translation(),
                    body.rotation()
                )

                return
            }

            if (previousTime !== gameLoopContext.timeAtLastFrame) {
                previousTime = gameLoopContext.timeAtLastFrame
                
                const position = body.translation()
                const rotation = body.rotation()

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

            callback(lerpVector, lerpRotation)
        }
    })
}
