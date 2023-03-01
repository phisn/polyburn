import { Canvas, render, useFrame, useThree } from "@react-three/fiber"
import { OrthographicCamera, Stats } from "@react-three/drei"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditorStore } from "./EditorStore";
import { insertShape } from "./world/World";
import { findClosestEdge, findClosestVertex, Shape as WorldShape } from "./world/Shape";
import * as THREE from "three"
import { Point } from "./world/Point"

export const snapDistance = 20

export const highlightColor = 0x33ff33
export const highlightObjectColor = 0xffff00
export const highlightDeleteColor = 0xff2222
export const highlightMoveColor = 0x00aaaa

function Vertex(props: { vertex: Point }) {
    return (
        <mesh position={[props.vertex.x, props.vertex.y, 0]} >
            <circleGeometry args={[5.0]} />
            <meshBasicMaterial color="#222228" />
            
            <mesh>
                <circleGeometry args={[4.0]} />
                <meshBasicMaterial color="#C8DB35" />
            </mesh>
        </mesh>
    )
}

function Shape(props: { shape: WorldShape }) {
    const threeShape = new THREE.Shape(
        props.shape.vertices.map(vertex => new THREE.Vector2(vertex.x, vertex.y))
    )

    useThree(state => state.onPointerMissed)

    const [hovered, setHovered] = useState(false)

    return (
        <>
            <mesh>
                <shapeGeometry args={[threeShape]} />
                <meshBasicMaterial color={"#DC5249"} />
            </mesh>
            { props.shape.vertices.map((vertex, i) =>
                <Vertex key={i} vertex={vertex} />
            ) }
        </>
    )
}

interface MousePointerHintProps {
    position: Point
    event: React.PointerEvent<HTMLDivElement>
}

function MousePointerHint(props: MousePointerHintProps) {
    const world = useEditorStore(state => state.world)

    const hint: Point | null = useMemo(() => {
        /*
        for (let i = world.entities.length - 1; i >= 0; i--) {
            const object = world.objects[i]
            
            if (isPointInsideObject(point, object)) {
                if (ctrl) {
                    state.applyVisualMods({ 
                        highlightObjects: [ { index: i, color: highlightDeleteColor } ]
                    })
                }
                else {
                    state.applyVisualMods({ 
                        highlightObjects: [ { index: i, color: highlightObjectColor } ]
                    })
                }
    
                return
            }
        }
        */
    
        const vertex = findClosestVertex(world.shapes, props.position, snapDistance)
    
        if (vertex) {
            const color = props.event.ctrlKey
                ? highlightDeleteColor
                : highlightColor
    
            return vertex.point
        }
    
        const edge = findClosestEdge(world.shapes, props.position, snapDistance)
    
        if (edge) {
            return edge.point
        }

        return null
    }, [world, props])

    return (
        <>
            { hint && 
                <mesh position={[hint.x, hint.y, 0]}>
                    <circleGeometry args={[5.0]} />
                    <meshBasicMaterial color="#aaffff" />
                </mesh>
            }
        </>
    )
}

function Editor() {
    const world = useEditorStore(state => state.world)
    const mutate = useEditorStore(state => state.mutate)

    const cameraRef = useRef<THREE.Camera>()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    
    const canvasToWorld = useCallback((canvasX: number, canvasY: number) => {
        if (cameraRef.current == null || canvasRef.current == null) {
            throw new Error("Camera or canvas ref is null")
        }

        const vector = new THREE.Vector3(
            (canvasX / canvasRef.current.clientWidth) * 2 - 1,
            -(canvasY / canvasRef.current.clientHeight) * 2 + 1,
            0.5
        )

        vector.unproject(cameraRef.current)

        return {
            x: vector.x,
            y: vector.y
        }
    }, [cameraRef, canvasRef])

    const onPointerMissed = useCallback((e: React.PointerEvent) => {
        const { x, y } = canvasToWorld(e.clientX, e.clientY)
            
        mutate(insertShape({
            vertices: [
                { x: x - 50, y: y + 50 },
                { x: x + 50, y: y + 50 },
                { x: x, y: y - 50 },
            ]
        }))
    }, [])

    const [hintProps, setHintProps] = useState<MousePointerHintProps>()

    return (
        <div className="h-screen w-screen">
            <Canvas
                style={{ background: "#222228" }}
                onPointerDown={onPointerMissed}
                onPointerMove={event => setHintProps({
                    position: canvasToWorld(event.clientX, event.clientY),
                    event
                })}
                ref={canvasRef} >
                <OrthographicCamera
                    ref={cameraRef}
                    makeDefault position={[0, 0, 10]} />
                { world.shapes.map((shape, i) => 
                    <Shape key={i} shape={shape} />
                ) }
                { hintProps && 
                    <MousePointerHint {...hintProps} /> 
                }
                <Stats />
                <primitive object={world} />
            </Canvas>
        </div>
    )
}

export default Editor
