import { OrthographicCamera } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useCallback, useEffect, useRef, useState } from "react"
import { EntityWith } from "runtime-framework/src/NarrowProperties"
import { RocketEntityComponents } from "runtime/src/core/rocket/RocketEntity"
import { OrthographicCamera as ThreeOrthographicCamera } from "three"

import { EntityStore } from "runtime-framework"
import { Point } from "runtime/src/model/world/Point"
import { gameCameraTransitionSpeed } from "../../common/Values"
import { useGameStore } from "../store/GameStore"
import { useGraphicUpdate } from "../store/useGraphicUpdate"
import { WebappComponents } from "./webapp-runtime/WebappComponents"

export function Camera(props: { store: EntityStore<WebappComponents> }) {
    const [rocket] = props.store.find(
        "interpolation",
        ...RocketEntityComponents,
    )

    return <CameraWithEntities rocket={rocket} />
}

export function CameraWithEntities(props: {
    rocket: EntityWith<
        WebappComponents,
        "interpolation" | (typeof RocketEntityComponents)[number]
    >
}) {
    const cameraRef = useRef<ThreeOrthographicCamera>(null!)

    const [cameraBounds, setCameraBounds] = useState<{
        topLeft: Point
        bottomRight: Point
    }>(props.rocket.components.rocket.currentLevel.components.level.camera)

    const animating = useRef(false)

    const cameraTargetSize = useRef<{ x: number; y: number } | null>(null)
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
            cameraRef.current.position.set(targetPositionX, targetPositionY, 10)
        }

        cameraTargetPosition.current = {
            x: targetPositionX,
            y: targetPositionY,
        }
    }, [cameraBounds])

    useGraphicUpdate(() => {
        previousRocketPosition.current =
            props.rocket.components.interpolation.position

        if (
            props.rocket.components.rocket.currentLevel.components.level
                .camera !== cameraBounds
        ) {
            animating.current = true
            setCameraBounds(
                props.rocket.components.rocket.currentLevel.components.level
                    .camera,
            )
        }

        updateCameraPosition()
    })

    useFrame((_, delta) => {
        if (animating.current) {
            const distance = delta * gameCameraTransitionSpeed

            const { newWidth, newHeight, overflow } = moveCameraTo(distance)

            cameraRef.current.top = newHeight / 2
            cameraRef.current.bottom = -newHeight / 2
            cameraRef.current.left = -newWidth / 2
            cameraRef.current.right = newWidth / 2

            cameraRef.current.updateProjectionMatrix()

            const x = moveTo(
                distance,
                cameraRef.current.position.x,
                cameraTargetPosition.current!.x,
            )
            const y = moveTo(
                distance,
                cameraRef.current.position.y,
                cameraTargetPosition.current!.y,
            )

            cameraRef.current.position.set(x.result, y.result, 10)

            if (overflow && x.overflow && y.overflow) {
                animating.current = false
            }
        }
    })

    const size = useThree(state => state.size)
    const zoom = useGameStore(store => store.zoom)

    useEffect(() => {
        const aspect = size.width / size.height

        const cameraSize = {
            x: (cameraBounds.bottomRight.x - cameraBounds.topLeft.x) / zoom,
            y: (cameraBounds.topLeft.y - cameraBounds.bottomRight.y) / zoom,
        }

        let targetSize

        if (aspect > cameraSize.x / cameraSize.y) {
            targetSize = {
                x: cameraSize.x,
                y: (cameraSize.x / size.width) * size.height,
            }
        } else {
            targetSize = {
                x: (cameraSize.y / size.height) * size.width,
                y: cameraSize.y,
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
    }, [size, cameraBounds, zoom, updateCameraPosition])

    function moveCameraTo(distance: number) {
        const currentWidth = cameraRef.current.right - cameraRef.current.left
        const currentHeight = cameraRef.current.top - cameraRef.current.bottom

        const widthDiff = Math.abs(cameraTargetSize.current!.x - currentWidth)
        const heightDiff = Math.abs(cameraTargetSize.current!.y - currentHeight)

        if (widthDiff > heightDiff) {
            const approx = moveTo(
                distance,
                currentWidth,
                cameraTargetSize.current!.x,
            )

            return {
                newWidth: approx.result,
                newHeight: (approx.result / currentWidth) * currentHeight,
                overflow: approx.overflow,
            }
        } else {
            const approx = moveTo(
                distance,
                currentHeight,
                cameraTargetSize.current!.y,
            )

            return {
                newWidth: (approx.result / currentHeight) * currentWidth,
                newHeight: approx.result,
                overflow: approx.overflow,
            }
        }
    }

    return <OrthographicCamera makeDefault manual ref={cameraRef} />
}

function moveTo(distance: number, source: number, target: number) {
    if (source < target) {
        const newSource = source + distance

        if (newSource > target) {
            return { result: target, overflow: true }
        }

        return { result: newSource, overflow: false }
    } else {
        const newSource = source - distance

        if (newSource < target) {
            return { result: target, overflow: true }
        }

        return { result: newSource, overflow: false }
    }
}
