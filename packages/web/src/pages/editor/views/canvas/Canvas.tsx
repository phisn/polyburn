import { OrthographicCamera as DreiOrthographicCamera } from "@react-three/drei"
import { Canvas as RawCanvas, useThree } from "@react-three/fiber"
import { lerp } from "game/src/model/utils"
import { useEffect } from "react"
import { OrthographicCamera, Vector3 } from "three"
import { useEditorStore } from "../../store/store"
import { EventHandler } from "./event/EventHandler"
import { Visual } from "./visual/Visual"

export function Canvas() {
    return (
        <RawCanvas frameloop="always">
            <Camera />
            <CameraScroll />
            <CameraTargetAnimation />
            <EventHandler />
            <Visual />
        </RawCanvas>
    )
}

function easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3)
}

export function CameraScroll() {
    const camera = useThree(x => x.camera) as OrthographicCamera
    const canvas = useThree(x => x.gl.domElement)

    const setPosition = useEditorStore(x => x.setCamera)
    const setZoom = useEditorStore(x => x.setCameraZoom)

    useEffect(() => {
        const onScroll = (raw: WheelEvent) => {
            const zoom = useEditorStore.getState().cameraZoom

            if ((raw.deltaY < 0 && zoom < 80) || (raw.deltaY > 0 && zoom > 2)) {
                const newZoom = 2 ** (Math.log2(zoom) - raw.deltaY / 100)
                setZoom(newZoom)

                const canvasCenter = {
                    x: canvas.width * 0.5,
                    y: canvas.height * 0.5,
                }

                const position = useEditorStore.getState().camera
                const positionWindow = camera.worldToLocal(new Vector3(position.x, position.y, 0))

                console.log(position, positionWindow)

                setPosition({
                    x: position.x + (canvasCenter.x - positionWindow.x) / newZoom,
                    y: position.y - (canvasCenter.y - positionWindow.y) / newZoom,
                })
            }

            // prevent browser scrolling
            raw.stopPropagation()
            raw.preventDefault()
        }

        canvas.addEventListener("wheel", onScroll)

        return () => {
            canvas.removeEventListener("wheel", onScroll)
        }
    }, [canvas, camera, setPosition, setZoom])

    return <></>
}

export function CameraTargetAnimation() {
    const target = useEditorStore(x => x.cameraTarget)

    const setTarget = useEditorStore(x => x.setCameraTarget)
    const setPosition = useEditorStore(x => x.setCamera)

    useEffect(() => {
        if (target) {
            let time = 0
            let frame: number | undefined

            const cameraAnimationFrame = (delta: number) => {
                time += delta

                const ratio = Math.min(1, time / 10_000_000)

                setPosition({
                    x: lerp(target.source.x, target.target.x, easeOutCubic(ratio)),
                    y: lerp(target.source.y, target.target.y, easeOutCubic(ratio)),
                })

                console.log(time, ratio)

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

/*
function HighlightPoints() {
    const store = useContext(EditorStoreContext)

    if (store === undefined) {
        throw new Error("EditorStore not found")
    }

    const focus = useSnapshot(store.resources.get("focus"))

    return (
        <>
            {focus.highlightPoints.map((x, i) => (
                <Fragment key={i}>
                    <mesh position={[x.point.x, x.point.y, 1]}>
                        <circleGeometry args={[0.016 * baseZoom]} />
                        <meshBasicMaterial color={x.color} />
                    </mesh>
                    <mesh position={[x.point.x, x.point.y, 0.5]}>
                        <circleGeometry args={[0.018 * baseZoom]} />
                        <meshBasicMaterial color={"#000000"} />
                    </mesh>
                </Fragment>
            ))}
        </>
    )
}

function PipelineEvent() {
    const store = useContext(EditorStoreContext)

    if (store === undefined) {
        throw new Error("EditorStore not found")
    }

    usePipelineEvent(event => store.events.invoke.canvas?.(event))

    return <></>
}

*/
