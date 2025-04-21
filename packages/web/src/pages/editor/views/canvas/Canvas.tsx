import { OrthographicCamera as DreiOrthographicCamera } from "@react-three/drei"
import { Canvas as RawCanvas, useThree } from "@react-three/fiber"
import { lerp } from "game/src/model/utils"
import { useEffect } from "react"
import { useEditorStore } from "../../store/store"
import { EventHandler } from "./event/EventHandler"
import { Visual } from "./visual/Visual"

export function Canvas() {
    return (
        <RawCanvas frameloop="always">
            <Camera />
            <CameraTargetMoveAnimation />
            <CameraTargetZoomAnimation />
            <EventHandler />
            <SyncCanvasSize />
            <Visual />
        </RawCanvas>
    )
}

function SyncCanvasSize() {
    const setCanvasSize = useEditorStore(x => x.setCanvasSize)
    const size = useThree(x => x.size)

    useEffect(() => {
        setCanvasSize({
            width: size.width,
            height: size.height,
        })
    }, [setCanvasSize, size.width, size.height])

    return <></>
}

function easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3)
}

export function CameraTargetMoveAnimation() {
    const target = useEditorStore(x => x.cameraTarget)

    const setTarget = useEditorStore(x => x.setCameraTarget)
    const setPosition = useEditorStore(x => x.setCamera)

    useEffect(() => {
        if (target) {
            let startTime: number | undefined
            let frame: number | undefined

            const cameraAnimationFrame = (timestamp: number) => {
                if (startTime === undefined) {
                    startTime = timestamp
                }

                const elapsed = timestamp - startTime
                const duration = 250
                const ratio = Math.min(1, elapsed / duration)

                setPosition({
                    x: lerp(target.source.x, target.target.x, easeOutCubic(ratio)),
                    y: lerp(target.source.y, target.target.y, easeOutCubic(ratio)),
                })

                if (ratio < 1) {
                    frame = requestAnimationFrame(cameraAnimationFrame)
                } else {
                    setTarget()
                }
            }

            frame = requestAnimationFrame(cameraAnimationFrame)

            return () => {
                if (frame) {
                    cancelAnimationFrame(frame)
                }
            }
        }
    }, [target, setPosition, setTarget])

    return <></>
}

export function CameraTargetZoomAnimation() {
    const cameraZoomTarget = useEditorStore(x => x.cameraZoomTarget)
    const setCameraZoomTarget = useEditorStore(x => x.setCameraZoomTarget)
    const setCamera = useEditorStore(x => x.setCamera)

    const camera = useThree(x => x.camera)

    useEffect(() => {
        if (cameraZoomTarget) {
            let startTime: number | undefined
            let frame: number | undefined

            const cameraAnimationFrame = (timestamp: number) => {
                if (startTime === undefined) {
                    startTime = timestamp
                }

                const elapsed = timestamp - startTime
                const duration = 250
                const ratio = Math.min(1, elapsed / duration)

                const zoom =
                    2 **
                    lerp(
                        Math.log2(cameraZoomTarget.source),
                        Math.log2(cameraZoomTarget.target),
                        easeOutCubic(ratio),
                    )

                useEditorStore.setState({
                    cameraZoom: zoom,
                })

                const canvasSize = useEditorStore.getState().canvasSize

                const canvasCenter = {
                    x: canvasSize.width * 0.5,
                    y: canvasSize.height * 0.5,
                }

                useEditorStore.getState().setCamera({
                    x:
                        cameraZoomTarget.sourcePoint.x +
                        (canvasCenter.x - cameraZoomTarget.sourcePointWindow.x) / zoom,
                    y:
                        cameraZoomTarget.sourcePoint.y -
                        (canvasCenter.y - cameraZoomTarget.sourcePointWindow.y) / zoom,
                })

                if (ratio < 1) {
                    frame = requestAnimationFrame(cameraAnimationFrame)
                } else {
                    setCameraZoomTarget()
                }
            }

            frame = requestAnimationFrame(cameraAnimationFrame)

            return () => {
                if (frame) {
                    cancelAnimationFrame(frame)
                }
            }
        }
    }, [camera, cameraZoomTarget, setCamera, setCameraZoomTarget])

    return <></>
}

export function Camera() {
    const position = useEditorStore(x => x.camera)
    const zoom = useEditorStore(x => x.cameraZoom)

    return (
        <DreiOrthographicCamera
            position={[position.x, position.y, 10]}
            makeDefault
            zoom={zoom}
            far={100}
            near={-100}
        />
    )
}
