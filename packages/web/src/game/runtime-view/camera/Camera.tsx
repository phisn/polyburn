import { OrthographicCamera } from "@react-three/drei"
import { useEffect, useRef, useState } from "react"
import { EntityStore } from "runtime-framework"
import { EntityWith } from "runtime-framework/src/NarrowProperties"
import { RocketEntityComponents } from "runtime/src/core/rocket/RocketEntity"
import { Point } from "runtime/src/model/Point"
import { OrthographicCamera as ThreeOrthographicCamera } from "three"
import { gameCameraTransitionSpeed } from "../../../common/Values"
import { WebappComponents } from "../../runtime-webapp/WebappComponents"
import { interpolationThreshold } from "../../runtime-webapp/interpolation/InterpolatedEntity"
import { useGameStore } from "../../store/GameStore"
import { useGraphicUpdate } from "../../store/useGraphicUpdate"
import { findCameraTargetPosition as findCameraPositionForEntity } from "./findCameraPositionForEntity"
import { moveCameraTo } from "./moveCameraTo"
import { moveSourceTo } from "./moveSourceTo"
import { useTargetSize } from "./useTargetSize"

const cameraAnimationThreshold = interpolationThreshold

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

    const zoom = useGameStore(store => store.zoom)
    const { targetSize, rotated } = useTargetSize(cameraBounds, zoom)

    // using ref for animating because usegraphicupdate can be called before the state is updated
    const animatingRef = useRef(false)

    const cameraRef = useRef<ThreeOrthographicCamera>(null!)

    useGraphicUpdate((_, delta) => {
        const newCameraBounds = props.rocket.components.rocket.currentLevel.components.level.camera

        if (newCameraBounds !== cameraBounds) {
            animatingRef.current = true
            setCameraBounds(newCameraBounds)
        }

        // determine the target position of the camera depending on the rocket position
        const targetPosition = findCameraPositionForEntity(
            props.rocket.components.interpolation.position,
            targetSize,
            newCameraBounds,
        )

        if (
            Math.abs(targetPosition.x - cameraRef.current.position.x) > cameraAnimationThreshold ||
            Math.abs(targetPosition.y - cameraRef.current.position.y) > cameraAnimationThreshold
        ) {
            animatingRef.current = true
        }

        if (animatingRef.current) {
            animateCameraSizeAndPosition(delta * gameCameraTransitionSpeed, targetPosition)
        } else {
            cameraRef.current.position.set(targetPosition.x, targetPosition.y, 10)
        }
    })

    // ensure camera still works when level changes
    useEffect(
        () => {
            if (animatingRef.current === false) {
                updateCameraFrustum({
                    top: targetSize.y / 2,
                    bottom: -targetSize.y / 2,
                    left: -targetSize.x / 2,
                    right: targetSize.x / 2,
                })

                const targetPosition = findCameraPositionForEntity(
                    props.rocket.components.interpolation.position,
                    targetSize,
                    cameraBounds,
                )

                cameraRef.current.position.set(targetPosition.x, targetPosition.y, 10)
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [targetSize, rotated],
    )

    function animateCameraSizeAndPosition(distance: number, targetPosition: Point) {
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
            animatingRef.current = false
        }
    }

    function updateCameraFrustum(bounds: {
        top: number
        bottom: number
        left: number
        right: number
    }) {
        if (rotated) {
            cameraRef.current.top = bounds.left
            cameraRef.current.bottom = bounds.right
            cameraRef.current.left = -bounds.bottom
            cameraRef.current.right = -bounds.top

            cameraRef.current.rotation.z = -Math.PI / 2
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
        const width = Math.abs(cameraRef.current.right - cameraRef.current.left)
        const height = Math.abs(cameraRef.current.top - cameraRef.current.bottom)

        return rotated ? { width: height, height: width } : { width, height }
    }

    return <OrthographicCamera makeDefault manual ref={cameraRef} />
}
