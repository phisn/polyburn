import { OrthographicCamera } from "@react-three/drei"
import { useEffect, useRef, useState } from "react"
import { EntityWith } from "runtime-framework/src/NarrowProperties"
import { RocketEntityComponents } from "runtime/src/core/rocket/RocketEntity"
import { OrthographicCamera as ThreeOrthographicCamera } from "three"

import { EntityStore } from "runtime-framework"
import { Point } from "runtime/src/model/Point"
import { gameCameraTransitionSpeed } from "../../../common/Values"
import { useGameStore } from "../../store/GameStore"
import { useGraphicUpdate } from "../../store/useGraphicUpdate"
import { WebappComponents } from "../webapp-runtime/WebappComponents"
import { findCameraTargetPosition } from "./findCameraTargetPosition"
import { moveCameraTo } from "./moveCameraTo"
import { moveSourceTo } from "./moveSourceTo"
import { useTargetSize } from "./useTargetSize"

export function Camera(props: { store: EntityStore<WebappComponents> }) {
    const [rocket] = props.store.find("interpolation", ...RocketEntityComponents)

    return <CameraWithEntity rocket={rocket} />
}

export function CameraWithEntity(props: {
    rocket: EntityWith<WebappComponents, "interpolation" | (typeof RocketEntityComponents)[number]>
}) {
    const [cameraBounds, setCameraBounds] = useState(
        props.rocket.components.rocket.currentLevel.components.level.camera,
    )

    const [animating, setAnimating] = useState(false)

    const zoom = useGameStore(store => store.zoom)
    const { targetSize, sizeRotated } = useTargetSize(cameraBounds, zoom)

    const previousRocketPosition = useRef<Point>(null!)
    const cameraRef = useRef<ThreeOrthographicCamera>(null!)

    useGraphicUpdate((_, delta) => {
        if (props.rocket.components.rocket.currentLevel.components.level.camera !== cameraBounds) {
            setAnimating(true)
            setCameraBounds(props.rocket.components.rocket.currentLevel.components.level.camera)
        }

        const targetPosition = findCameraTargetPosition(
            props.rocket.components.interpolation.position,
            targetSize,
            cameraBounds,
        )

        if (animating) {
            animateCamera(delta * gameCameraTransitionSpeed, targetPosition)
        } else {
            cameraRef.current.position.set(targetPosition.x, targetPosition.y, 10)
        }
    })

    useEffect(() => {
        updateCameraFrustum({
            top: targetSize.y / 2,
            bottom: -targetSize.y / 2,
            left: -targetSize.x / 2,
            right: targetSize.x / 2,
        })

        const targetPosition = findCameraTargetPosition(
            props.rocket.components.interpolation.position,
            targetSize,
            cameraBounds,
        )

        cameraRef.current.position.set(targetPosition.x, targetPosition.y, 10)
    }, [targetSize, sizeRotated])

    function animateCamera(distance: number, targetPosition: Point) {
        const { newWidth, newHeight, overflow } = moveCameraTo(
            distance,
            getCameraFrustumSize(),
            targetSize,
        )

        updateCameraFrustum({
            top: newHeight / 2,
            bottom: -newHeight / 2,
            left: -newWidth / 2,
            right: newWidth / 2,
        })

        const x = moveSourceTo(distance, cameraRef.current.position.x, targetPosition.x)
        const y = moveSourceTo(distance, cameraRef.current.position.y, targetPosition.y)

        cameraRef.current.position.set(x.result, y.result, 10)

        if (overflow && x.overflow && y.overflow) {
            setAnimating(false)
        }
    }

    function updateCameraFrustum(bounds: {
        top: number
        bottom: number
        left: number
        right: number
    }) {
        if (sizeRotated) {
            cameraRef.current.top = bounds.left
            cameraRef.current.bottom = bounds.right
            cameraRef.current.left = -bounds.bottom
            cameraRef.current.right = -bounds.top

            cameraRef.current.rotation.z = Math.PI / 2
        } else {
            cameraRef.current.top = bounds.top
            cameraRef.current.bottom = bounds.bottom
            cameraRef.current.left = bounds.left
            cameraRef.current.right = bounds.right

            cameraRef.current.rotation.z = 0
        }

        cameraRef.current.updateProjectionMatrix()
    }

    function getCameraFrustumSize() {
        const width = cameraRef.current.right - cameraRef.current.left
        const height = cameraRef.current.top - cameraRef.current.bottom

        return sizeRotated ? { width: height, height: width } : { width, height }
    }

    return <OrthographicCamera makeDefault manual ref={cameraRef} />
}