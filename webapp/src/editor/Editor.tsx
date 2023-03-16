import { OrthographicCamera } from "@react-three/drei"
import { Canvas, useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import { Camera } from "three"
import tunnel from "tunnel-rat"

import Game from "../game/Game"
import { Point } from "../model/world/Point"
import { Mode } from "./editor-store/ModeStateBase"
import { useEditorStore } from "./editor-store/useEditorStore"
import EditorNavbar from "./EditorNavbar"
import Navbar from "./Navbar"
import PlacementMode from "./placement/PlacementMode"
import { baseZoom, baseZoomFactor } from "./Values"

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
                        firstPosition.current.camera.x + (firstPosition.current.mouse.x - point.x) * baseZoomFactor,
                        firstPosition.current.camera.y + (firstPosition.current.mouse.y - point.y) * baseZoomFactor,
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

const StopFillSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#CD5C5C" viewBox="0 0 16 16">
        <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
    </svg>
)

function Editor() {
    const running = useEditorStore(state => state.running)
    const stop = useEditorStore(state => state.stop)

    if (running) {
        return (
            <>
                <Game world={useEditorStore.getState().world} />
                <div className="absolute top-0 left-0 p-4">
                    <Navbar>
                        <button className="btn btn-square btn-ghost"
                            onClick={stop} >
                                
                            <StopFillSvg />
                        </button>
                    </Navbar>
                </div>
            </>
        )
    }
    else {
        return (
            <EditorInner />
        )
    }
}

function EditorInner() {
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
                    zoom={baseZoom}
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
