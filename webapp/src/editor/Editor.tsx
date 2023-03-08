import { OrthographicCamera } from "@react-three/drei"
import { Canvas, useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import { Camera } from "three"
import tunnel from "tunnel-rat"

import { Mode } from "./editor-store/ModeStateBase"
import { useEditorStore } from "./editor-store/useEditorStore"
import EditorNavbar from "./EditorNavbar"
import PlacementMode from "./placement/PlacementMode"
import { Point } from "./world/Point"

export const buildCanvasToWorld = (camera?: Camera, canvas?: HTMLCanvasElement) => {
    if (!camera || !canvas) {
        return () => ({ x: 0, y: 0 })
    }

    return (x: number, y: number) => {
        const vector = new THREE.Vector3(
            (x / canvas.clientWidth) * 2 - 1,
            -(y / canvas.clientHeight) * 2 + 1,
            0.5
        )
    
        vector.unproject(camera)
    
        return {
            x: vector.x,
            y: vector.y
        }
    }
}

function EditorMode() {
    const mode = useEditorStore(state => state.modeState.mode)

    switch (mode) {
    case Mode.Placement:
        return <PlacementMode />

    }

    return <></>
}

// singleton tunnel
export const editorModeTunnel = tunnel()

function EditorControls() {
    const canvas = useThree(state => state.gl.domElement)
    const camera = useThree(state => state.camera)

    interface FirstPosition {
        mouse: Point
        camera: Point
    }

    const firstPosition = useRef<FirstPosition | null>(null)

    console.log("render")

    useEffect(() => {
        const onPointerEvent = (event: PointerEvent) => {
            const point = { x: event.clientX, y: -event.clientY }

            if (event.buttons & 4) {
                if (firstPosition.current === null) {
                    firstPosition.current = {
                        mouse: point,
                        camera: { x: camera.position.x, y: camera.position.y }
                    }
                }
                else if (event.type === "pointermove") {
                    camera.position.set(
                        firstPosition.current.camera.x + (firstPosition.current.mouse.x - point.x),
                        firstPosition.current.camera.y + (firstPosition.current.mouse.y - point.y),
                        10
                    )
                }
            }
            else {
                if (firstPosition.current) {
                    firstPosition.current = null
                }
            }
        }

        canvas.addEventListener("pointerdown", onPointerEvent)
        canvas.addEventListener("pointermove", onPointerEvent)
        canvas.addEventListener("pointerup", onPointerEvent)

        return () => {
            canvas.removeEventListener("pointerdown", onPointerEvent)
            canvas.removeEventListener("pointermove", onPointerEvent)
            canvas.removeEventListener("pointerup", onPointerEvent)
        }
    })

    return <></>
}

function Editor() {
    return (
        <div className="h-screen w-screen">
            <Canvas style={{ background: "#000000" }} >
                <EditorControls />
                <EditorMode />
                
                <OrthographicCamera
                    makeDefault
                    position={[0, 0, 10]}
                    rotation={[0, 0, 0]}
                    far={10000}
                />

                {/* <Stats /> */}
            </Canvas>
            <div className="absolute top-0 left-0 p-4">
                <EditorNavbar />
            </div>
            <editorModeTunnel.Out />
        </div>
    )
}

export default Editor
