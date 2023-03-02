import { Canvas, render, useFrame, useThree } from "@react-three/fiber"
import { OrthographicCamera, Stats } from "@react-three/drei"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditorStore } from "./editor-store/useEditorStore";
import { insertShape } from "./world/World";
import { findClosestEdge, findClosestVertex, Shape as WorldShape } from "./world/Shape";
import * as THREE from "three"
import { Point } from "./world/Point"
import { Camera } from "three";
import { Mode } from "./editor-store/ModeStateBase";
import PlacementMode from "./placement/PlacementMode";

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

function EditorControls() {
    const mutate = useEditorStore(state => state.mutate)

    const canvas = useThree(state => state.gl.domElement)
    const camera = useThree(state => state.camera)

    const canvasToWorld = useMemo(() => buildCanvasToWorld(camera, canvas), [camera, canvas])

    const raycaster = useThree(state => state.raycaster)
    const scene = useThree(state => state.scene)

    useEffect(() => {
        const onPointerDown = (e: PointerEvent) => {
            
        }

        canvas.addEventListener("pointerdown", onPointerDown)

        return () => {
            canvas.removeEventListener("pointerdown", onPointerDown)
        }
    })

    return <></>
}

function Editor() {
    return (
        <div className="h-screen w-screen">
            <Canvas style={{ background: "#222228" }} >
                <EditorControls />
                <EditorMode />
                
                <OrthographicCamera
                    makeDefault position={[0, 0, 10]} />

                <Stats />
            </Canvas>
        </div>
    )
}

export default Editor
