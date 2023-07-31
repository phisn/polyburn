import { OrthographicCamera } from "@react-three/drei"
import { useRef, useState } from "react"
import { OrthographicCamera as ThreeOrthographicCamera } from "three"
import { ConsumeEvent, Priority, useEventListener } from "../store/EventStore"

interface ModeNone {
    type: "none"
}

interface ModeMoving {
    type: "moving"
    start: { x: number; y: number }
}

type Mode = ModeNone | ModeMoving

const zoom = 50

export function Camera() {
    const cameraRef = useRef<ThreeOrthographicCamera>(null!)
    const [mode, setMode] = useState<Mode>({ type: "none" })

    useEventListener(
        event => {
            if (event.consumed) {
                return
            }

            switch (mode.type) {
                case "none":
                    if (event.leftButtonClicked) {
                        setMode({
                            type: "moving",
                            start: {
                                x: cameraRef.current.position.x + event.positionInWindow.x / zoom,
                                y: cameraRef.current.position.y - event.positionInWindow.y / zoom,
                            },
                        })
                        return
                    }

                    break
                case "moving":
                    if (event.leftButtonDown) {
                        cameraRef.current.position.set(
                            mode.start.x - event.positionInWindow.x / zoom,
                            mode.start.y + event.positionInWindow.y / zoom,
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

    return (
        <OrthographicCamera ref={cameraRef} position={[0, 0, 100]} makeDefault manual zoom={50} />
    )
}
