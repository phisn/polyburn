import { OrthographicCamera } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import { OrthographicCamera as ThreeOrthographicCamera } from "three"
import { Priority } from "../models/priority"
import { ConsumeEvent, useEventListener } from "../store/EventStore"

interface ModeNone {
    type: "none"
}

interface ModeMoving {
    type: "moving"
    start: { x: number; y: number }
}

type Mode = ModeNone | ModeMoving

export function Camera() {
    const cameraRef = useRef<ThreeOrthographicCamera>(null!)
    const positionRef = useRef({
        window: { x: 0, y: 0 },
        world: { x: 0, y: 0 },
    })

    const canvas = useThree(state => state.gl.domElement)
    const canvasSize = useThree(state => state.size)
    const invalidate = useThree(state => state.invalidate)

    const [mode, setMode] = useState<Mode>({ type: "none" })

    useEventListener(
        event => {
            positionRef.current.world.x = event.position.x
            positionRef.current.world.y = event.position.y

            positionRef.current.window.x = event.positionInWindow.x
            positionRef.current.window.y = event.positionInWindow.y

            if (event.consumed) {
                return
            }

            switch (mode.type) {
                case "none":
                    if (event.leftButtonClicked) {
                        setMode({
                            type: "moving",
                            start: {
                                x:
                                    cameraRef.current.position.x +
                                    event.positionInWindow.x / cameraRef.current.zoom,
                                y:
                                    cameraRef.current.position.y -
                                    event.positionInWindow.y / cameraRef.current.zoom,
                            },
                        })
                        return
                    }

                    break
                case "moving":
                    if (event.leftButtonDown) {
                        cameraRef.current.position.set(
                            mode.start.x - event.positionInWindow.x / cameraRef.current.zoom,
                            mode.start.y + event.positionInWindow.y / cameraRef.current.zoom,
                            cameraRef.current.position.z,
                        )

                        return ConsumeEvent
                    } else {
                        setMode({ type: "none" })
                    }

                    return ConsumeEvent
            }
        },
        mode.type === "none" ? Priority.Fallback : Priority.Action,
    )

    useEffect(() => {
        const onScroll = (raw: WheelEvent) => {
            if (
                (raw.deltaY < 0 && cameraRef.current.zoom < 80) ||
                (raw.deltaY > 0 && cameraRef.current.zoom > 2)
            ) {
                cameraRef.current.zoom = 2 ** (Math.log2(cameraRef.current.zoom) - raw.deltaY / 100)
                cameraRef.current.updateProjectionMatrix()

                const canvasCenter = {
                    x: canvasSize.width * 0.5,
                    y: canvasSize.height * 0.5,
                }

                cameraRef.current.position.set(
                    positionRef.current.world.x +
                        (canvasCenter.x - positionRef.current.window.x) / cameraRef.current.zoom,
                    positionRef.current.world.y -
                        (canvasCenter.y - positionRef.current.window.y) / cameraRef.current.zoom,
                    cameraRef.current.position.z,
                )
            }

            // prevent browser scrolling
            raw.stopPropagation()
            raw.preventDefault()

            // camera zooming is not triggered by event listener so we have to
            // invalidate manually
            invalidate()
        }

        canvas.addEventListener("wheel", onScroll)

        return () => {
            canvas.removeEventListener("wheel", onScroll)
        }
    }, [canvas, canvasSize, invalidate])

    return (
        <OrthographicCamera ref={cameraRef} position={[0, 0, 100]} makeDefault manual zoom={50} />
    )
}
