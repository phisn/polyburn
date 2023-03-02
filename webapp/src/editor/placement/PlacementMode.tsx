import { Canvas, render, useFrame, useThree } from "@react-three/fiber"
import { OrthographicCamera, Stats } from "@react-three/drei"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three"
import { Camera } from "three";
import { Point } from "../world/Point";
import { findClosestEdge, findClosestVertex, Shape as WorldShape } from "../world/Shape";
import { useEditorStore } from "../editor-store/useEditorStore";
import { buildCanvasToWorld } from "../Editor";
import { HintType } from "../editor-store/PlacementState";
import { highlightColor, highlightDeleteColor, highlightVertexColor, snapDistance } from "../Values";

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

function MousePointerHint() {
    const hint = useEditorStore(state => state.modeState.hint)

    const color = useMemo(() => {
        switch (hint?.type) {
            case HintType.Vertex:
                return hint.delete ? highlightDeleteColor : highlightVertexColor
            case HintType.Edge:
                return hint.delete ? highlightDeleteColor : highlightColor
            default:
                return ""
        }
    }, [hint])

    return (
        <>
            { hint && hint.type !== HintType.Space &&
                <mesh position={[hint.point.x, hint.point.y, 0.5]}>
                    <circleGeometry args={[5.0]} />
                    <meshBasicMaterial color={color} />
                </mesh>
            }
        </>
    )
}

function PlacementMode() {
    const canvas = useThree(state => state.gl.domElement)
    const camera = useThree(state => state.camera)

    const world = useEditorStore(state => state.world)
    const setModeState = useEditorStore(state => state.setModeState)

    const canvasToWorld = useMemo(() => buildCanvasToWorld(camera, canvas), [camera, canvas])

    useEffect(() => {
        const onPointerMove = (e: PointerEvent) => {
            const point = canvasToWorld(e.clientX, e.clientY)

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
        
            const vertex = findClosestVertex(world.shapes, point, snapDistance)
        
            if (vertex) {
                setModeState({
                    hint: {
                        type: HintType.Vertex,
                        point: vertex.point,
                        delete: e.ctrlKey
                    }
                })
        
                return
            }
        
            const edge = findClosestEdge(world.shapes, point, snapDistance)
        
            if (edge) {
                setModeState({
                    hint: {
                        type: HintType.Edge,
                        point: edge.point,
                        delete: e.ctrlKey
                    }
                })
        
                return
            }

            setModeState({
                hint: {
                    type: HintType.Space,
                    point,
                    delete: e.ctrlKey
                }
            })
        }

        const onPointerDown = (e: PointerEvent) => {
            
        }

        canvas.addEventListener("pointermove", onPointerMove)

        return () => {
            canvas.removeEventListener("pointermove", onPointerMove)
        }
    })

    return (
        <>
            <MousePointerHint /> 
   
            { 
                world.shapes.map((shape, i) => <Shape key={i} shape={shape} /> ) 
            }
        </>
    )
}

export default PlacementMode
