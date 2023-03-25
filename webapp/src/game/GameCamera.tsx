import { OrthographicCamera } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { OrthographicCamera as ThreeOrthographicCamera } from "three"

import { Point } from "../model/world/Point"
import { useInterpolation } from "./components/useInterpolation"
import { Simulation } from "./simulation/createSimulation"
import { GameLoopContext } from "./useGameLoop"

function GameCameraAnimated(props: { 
    simulation: Simulation 
}) {
    const cameraRef = useRef<ThreeOrthographicCamera>(null!)
    const gameLoopContext = useContext(GameLoopContext)

    const [cameraBounds, setCameraBounds] = useState<{ topLeft: Point, bottomRight: Point }>(
        props.simulation.currentLevel.camera
    )

    const animating = useRef(false)

    useEffect(() => gameLoopContext.subscribe(() => {
        if (props.simulation.currentLevel.camera !== cameraBounds) {
            animating.current = true
            setCameraBounds(props.simulation.currentLevel.camera)
        }
    }))
    
    const cameraTargetSize = useRef<{ x: number, y: number } | null>(null)
    const cameraTargetPosition = useRef<Point | null>(null)
    const previousRocketPosition = useRef<Point | null>(null)

    const updateCameraPosition = useCallback(() => {
        const targetSize = cameraTargetSize.current ?? { x: 0, y: 0 }

        let targetPositionX = previousRocketPosition.current?.x ?? 0
        let targetPositionY = previousRocketPosition.current?.y ?? 0

        if (targetPositionX < cameraBounds.topLeft.x + targetSize.x / 2) {
            targetPositionX = cameraBounds.topLeft.x + targetSize.x / 2
        }

        if (targetPositionX > cameraBounds.bottomRight.x - targetSize.x / 2) {
            targetPositionX = cameraBounds.bottomRight.x - targetSize.x / 2
        }

        if (targetPositionY > cameraBounds.topLeft.y - targetSize.y / 2) {
            targetPositionY = cameraBounds.topLeft.y - targetSize.y / 2
        }

        if (targetPositionY < cameraBounds.bottomRight.y + targetSize.y / 2) {
            targetPositionY = cameraBounds.bottomRight.y + targetSize.y / 2
        }

        if (animating.current === false) {
            cameraRef.current.position.set(
                targetPositionX,
                targetPositionY,
                10
            )
        }

        cameraTargetPosition.current = { x: targetPositionX, y: targetPositionY }
    }, [ cameraBounds ])

    useInterpolation(props.simulation.rocket.body, (point: Point) => {
        previousRocketPosition.current = point

        if (animating.current) {
            void 0
        }
        else {
            updateCameraPosition()
        }
    })

    const moveTo = (distance: number, source: number, target: number) => {
        if (source < target) {
            const newSource = source + distance

            if (newSource > target) {
                return { result: target, overflow: true }
            }

            return { result: newSource, overflow: false }
        }
        else {
            const newSource = source - distance

            if (newSource < target) {
                return { result: target, overflow: true }
            }

            return { result: newSource, overflow: false }
        }
    }

    useFrame((_, delta) => {
        if (animating.current) {
            const sizeDistance = delta * 25
            const positionDistance = delta * 25

            const top = moveTo(sizeDistance, cameraRef.current.top, cameraTargetSize.current!.y / 2)
            cameraRef.current.top = top.result

            const bottom = moveTo(sizeDistance, cameraRef.current.bottom, -cameraTargetSize.current!.y / 2)
            cameraRef.current.bottom = bottom.result

            const left = moveTo(sizeDistance, cameraRef.current.left, -cameraTargetSize.current!.x / 2)
            cameraRef.current.left = left.result

            const right = moveTo(sizeDistance, cameraRef.current.right, cameraTargetSize.current!.x / 2)
            cameraRef.current.right = right.result
            
            cameraRef.current.updateProjectionMatrix()
            
            const x = moveTo(positionDistance, cameraRef.current.position.x, cameraTargetPosition.current!.x)
            const y = moveTo(positionDistance, cameraRef.current.position.y, cameraTargetPosition.current!.y)
            
            cameraRef.current.position.set(x.result, y.result, 10)

            if (top.overflow && bottom.overflow && left.overflow && right.overflow && x.overflow && y.overflow) {
                animating.current = false
            }
        }
    })

    const size = useThree(state => state.size)

    useEffect(() => {
        const aspect = size.width / size.height
    
        const cameraSize = {
            x: cameraBounds.bottomRight.x - cameraBounds.topLeft.x,
            y: cameraBounds.topLeft.y - cameraBounds.bottomRight.y
        }
    
        let targetSize
    
        if (aspect > cameraSize.x / cameraSize.y) {
            targetSize = {
                x: cameraSize.x,
                y: cameraSize.x / size.width * size.height
            }
        }
        else {
            targetSize = {
                x: cameraSize.y / size.height * size.width,
                y: cameraSize.y
            }
        }

        if (animating.current === false) {
            cameraRef.current.top = targetSize.y / 2
            cameraRef.current.bottom = -targetSize.y / 2
            cameraRef.current.left = -targetSize.x / 2 
            cameraRef.current.right = targetSize.x / 2

            cameraRef.current.updateProjectionMatrix()
        }

        cameraTargetSize.current = targetSize

        updateCameraPosition()
    }, [ size, cameraBounds, updateCameraPosition ])

    return (
        <OrthographicCamera 
            makeDefault manual
            ref={cameraRef}
        />
    )
}

export default GameCameraAnimated
