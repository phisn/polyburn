import { OrthographicCamera } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { useRef } from "react"
import { OrthographicCamera as ThreeOrthographicCamera } from "three"

import { Point } from "../model/world/Point"
import { useInterpolation } from "./components/useInterpolation"
import { LevelModel as SimulationLevel } from "./simulation/createLevel"
import { SimulationRocket } from "./simulation/createRocket"

function GameCamera(props: { 
    rocket: SimulationRocket, 
    currentLevel: SimulationLevel 
}) {
    const size = useThree(({ size }) => size)
    const cameraRef = useRef<ThreeOrthographicCamera>(null!)
 
    const previousTargetSize = useRef<{ x: number, y: number } | null>(null)

    useInterpolation(props.rocket.body, (point: Point) => {
        const cameraBounds = {
            x: props.currentLevel.camera.bottomRight.x - props.currentLevel.camera.topLeft.x,
            y: props.currentLevel.camera.topLeft.y - props.currentLevel.camera.bottomRight.y
        }

        let targetSize

        if (size.width / size.height > cameraBounds.x / cameraBounds.y) {
            targetSize = {
                x: cameraBounds.x,
                y: cameraBounds.x / size.width * size.height
            }
        }
        else {
            targetSize = {
                x: cameraBounds.y / size.height * size.width,
                y: cameraBounds.y
            }
        }

        const targetPosition = point

        if (targetPosition.x < props.currentLevel.camera.topLeft.x + targetSize.x / 2) {
            targetPosition.x = props.currentLevel.camera.topLeft.x + targetSize.x / 2
        }

        if (targetPosition.x > props.currentLevel.camera.bottomRight.x - targetSize.x / 2) {
            targetPosition.x = props.currentLevel.camera.bottomRight.x - targetSize.x / 2
        }

        if (targetPosition.y > props.currentLevel.camera.topLeft.y - targetSize.y / 2) {
            targetPosition.y = props.currentLevel.camera.topLeft.y - targetSize.y / 2
        }

        if (targetPosition.y < props.currentLevel.camera.bottomRight.y + targetSize.y / 2) {
            targetPosition.y = props.currentLevel.camera.bottomRight.y + targetSize.y / 2
        }

        cameraRef.current.position.set(
            targetPosition.x,
            targetPosition.y,
            10
        )

        if (previousTargetSize.current === null ||
            previousTargetSize.current.x !== targetSize.x ||
            previousTargetSize.current.y !== targetSize.y) 
        {
            console.log("update camera size")
            previousTargetSize.current = targetSize
            
            cameraRef.current.top = targetSize.y / 2
            cameraRef.current.bottom = -targetSize.y / 2
            cameraRef.current.left = -targetSize.x / 2 
            cameraRef.current.right = targetSize.x / 2
        
            cameraRef.current.updateProjectionMatrix()
        }
    })

    return (
        <OrthographicCamera 
            makeDefault manual

            ref={cameraRef}
        />
    )
}

export default GameCamera
