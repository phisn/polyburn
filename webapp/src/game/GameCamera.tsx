import { OrthographicCamera } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { useCallback, useEffect, useRef } from "react"
import { OrthographicCamera as ThreeOrthographicCamera } from "three"

import { Point } from "../model/world/Point"
import { useInterpolation } from "./components/useInterpolation"
import { Simulation } from "./simulation/createSimulation"

function GameCamera(props: { 
    simulation: Simulation 
}) {
    const cameraRef = useRef<ThreeOrthographicCamera>(null!)

    const previousTargetSize = useRef<{ x: number, y: number } | null>(null)
    const previousPoint = useRef<Point | null>(null)

    const updateCameraPosition = useCallback(() => {
        const targetSize = previousTargetSize.current ?? { x: 0, y: 0 }

        let targetPositionX = previousPoint.current?.x ?? 0
        let targetPositionY = previousPoint.current?.y ?? 0

        if (targetPositionX < props.simulation.currentLevel.camera.topLeft.x + targetSize.x / 2) {
            targetPositionX = props.simulation.currentLevel.camera.topLeft.x + targetSize.x / 2
        }

        if (targetPositionX > props.simulation.currentLevel.camera.bottomRight.x - targetSize.x / 2) {
            targetPositionX = props.simulation.currentLevel.camera.bottomRight.x - targetSize.x / 2
        }

        if (targetPositionY > props.simulation.currentLevel.camera.topLeft.y - targetSize.y / 2) {
            targetPositionY = props.simulation.currentLevel.camera.topLeft.y - targetSize.y / 2
        }

        if (targetPositionY < props.simulation.currentLevel.camera.bottomRight.y + targetSize.y / 2) {
            targetPositionY = props.simulation.currentLevel.camera.bottomRight.y + targetSize.y / 2
        }

        cameraRef.current.position.set(
            targetPositionX,
            targetPositionY,
            10
        )

    }, [ props.simulation.currentLevel.camera ])

    const size = useThree(state => state.size)

    useEffect(() => {
        const aspect = size.width / size.height
    
        const cameraBounds = {
            x: props.simulation.currentLevel.camera.bottomRight.x - props.simulation.currentLevel.camera.topLeft.x,
            y: props.simulation.currentLevel.camera.topLeft.y - props.simulation.currentLevel.camera.bottomRight.y
        }
    
        let targetSize
    
        if (aspect > cameraBounds.x / cameraBounds.y) {
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
            
        cameraRef.current.top = targetSize.y / 2
        cameraRef.current.bottom = -targetSize.y / 2
        cameraRef.current.left = -targetSize.x / 2 
        cameraRef.current.right = targetSize.x / 2
        
        cameraRef.current.updateProjectionMatrix()
    
        previousTargetSize.current = targetSize

        updateCameraPosition()
    }, [ 
        size, 
        props.simulation.currentLevel.camera ,
        updateCameraPosition
    ])

    useInterpolation(props.simulation.rocket.body, (point: Point) => {
        previousPoint.current = point
        updateCameraPosition()
    })

    return (
        <OrthographicCamera 
            makeDefault manual
            ref={cameraRef}
        />
    )
}

export default GameCamera
