import { Canvas, render, useFrame, useThree } from "@react-three/fiber"
import { OrthographicCamera, Stats } from "@react-three/drei"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditorStore } from "./editor-store/useEditorStore";
import { insertShape } from "./world/World";
import { findClosestEdge, findClosestVertex, Shape as WorldShape } from "./world/Shape";
import * as THREE from "three"
import { Point } from "./world/Point"
import { Camera } from "three";
import EditorMode from "./EditorMode";


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

function EditorControls() {
    const mutate = useEditorStore(state => state.mutate)

    const canvas = useThree(state => state.gl.domElement)
    const camera = useThree(state => state.camera)

    const canvasToWorld = useMemo(() => buildCanvasToWorld(camera, canvas), [camera, canvas])

    const raycaster = useThree(state => state.raycaster)
    const scene = useThree(state => state.scene)

    useEffect(() => {
        const onPointerDown = (e: PointerEvent) => {
            if (raycaster.intersectObjects(scene.children).length === 0) {
                const { x, y } = canvasToWorld(e.clientX, e.clientY)
                
                mutate(insertShape({
                    vertices: [
                        { x: x - 50, y: y + 50 },
                        { x: x + 50, y: y + 50 },
                        { x: x, y: y - 50 },
                    ]
                }))
            }
        }

        canvas.addEventListener("pointerdown", onPointerDown)

        return () => {
            canvas.removeEventListener("pointerdown", onPointerDown)
        }
    })

    return <></>
}

function Editor() {
    const [hintProps, setHintProps] = useState<MousePointerHintProps>()

    const world = useEditorStore(state => state.world)
    const mutate = useEditorStore(state => state.mutate)

    const cameraRef = useRef<THREE.Camera>()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    
    const canvasToWorld = useMemo(() => (x: number, y: number) => {
        if (cameraRef.current && canvasRef.current) {
            return buildCanvasToWorld(cameraRef.current, canvasRef.current)(x, y)
        }
        else {
            return { x: 0, y: 0 }
        }
    }, [])

    const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        setHintProps({
            position: canvasToWorld(event.clientX, event.clientY),
            event
        })
    }

    return (
        <div className="h-screen w-screen">
            <Canvas
                style={{ background: "#222228" }}
                ref={canvasRef} >

                <EditorMode />
                <EditorControls />
                
                <OrthographicCamera
                    ref={cameraRef}
                    makeDefault position={[0, 0, 10]} />
                <Stats />
            </Canvas>
        </div>
    )
}

export default Editor
