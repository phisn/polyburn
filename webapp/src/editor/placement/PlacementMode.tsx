import { Canvas, render, useFrame, useThree } from "@react-three/fiber"
import { OrthographicCamera, Stats } from "@react-three/drei"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three"
import { Camera } from "three";
import { Point } from "../world/Point";
import { findClosestEdge, findClosestVertex, Shape as WorldShape } from "../world/Shape";
import { useEditorStore } from "../editor-store/useEditorStore";
import { buildCanvasToWorld } from "../Editor";
import { highlightColor, highlightDeleteColor, highlightVertexColor, snapDistance } from "../Values";
import { insertShape, insertVertex } from "../world/World";
import { HintType } from "./Hint";
import EventListener from "./EventListener";

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

    const hintPoint = useMemo(() => {
        switch (hint?.type) {
            case HintType.Vertex:
                return {
                    color: hint.delete ? highlightDeleteColor : highlightVertexColor,
                    point: hint.point
                }

            case HintType.Edge:
                return {
                    color: highlightColor,
                    point: hint.point
                }

            default:
                return null
        }

    }, [hint])

    return (
        <>
            { hintPoint &&
                <mesh position={[hintPoint.point.x, hintPoint.point.y, 0.5]}>
                    <circleGeometry args={[5.0]} />
                    <meshBasicMaterial color={hintPoint.color} />
                </mesh>
            }
        </>
    )
}

function PlacementMode() {
    const world = useEditorStore(state => state.world)

    return (
        <>
            <MousePointerHint /> 
            <EventListener />

            { 
                world.shapes.map((shape, i) => <Shape key={i} shape={shape} /> ) 
            }
        </>
    )
}

export default PlacementMode
